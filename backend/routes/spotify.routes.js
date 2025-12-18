import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";

const router = express.Router();

router.get("/auth/spotify/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex"); //randomise state so callback can be verified
    req.session.spotifyState = state; //store state in server side session

    // request top artists/tracks, private & collaborative playlists and recently played data
    const scope = ["user-top-read", "playlist-read-private", "playlist-read-collaborative", "user-read-recently-played"].join(" ");

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

router.get("/auth/spotify/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!state || state !== req.session.spotifyState) {
        return res.status(400).send("State mismatch");
    }
    delete req.session.spotifyState; // Wipe state once it's been verified

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),},
                body: new URLSearchParams({grant_type: "authorization_code", code, redirect_uri: process.env.SPOTIFY_REDIRECT_URI,}),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Spotify token error:", tokenData);
            return res.status(500).send("Token exchange failed");
        }

        // Store tokens in session (in-memory)
        req.session.spotify = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        };
        console.log("Spotify access token received");

        res.redirect("/"); // Redirect home
    } catch (err) {
        console.error("Spotify callback error:", err);
        res.status(500).send("Spotify callback failed");
    }
});

router.get("/api/spotify/profile", async (req, res) => {
    const spotifySession = req.session.spotify;

    if (!spotifySession?.accessToken) {
        return res.status(401).json({ error: "Not authenticated with Spotify" });
    }

    try {
        const headers = {Authorization: `Bearer ${spotifySession.accessToken}`,};

        const [artistsRes, tracksRes, recentRes] = await Promise.all([
            fetch("https://api.spotify.com/v1/me/top/artists?limit=10", { headers }),
            fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", { headers }),
            fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", { headers })
        ]);

        const artistsData = await artistsRes.json();
        const tracksData = await tracksRes.json();
        const recentData = await recentRes.json();
        res.json({artists: artistsData.items, tracks: tracksData.items, recent: recentData.items});
    } catch (err) {
        console.error("Spotify profile error:", err);
        res.status(500).json({ error: "Spotify profile failed to load" });
    }
});

export default router;
