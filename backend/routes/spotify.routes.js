import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser} from "../services/spotify.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const router = express.Router();

router.get("/auth/spotify/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex"); //randomise state so callback can be verified
    req.session.spotifyState = state; //store state in server side session

    // request info needed from Spotify
    const scope = [
        "user-top-read",
        "user-read-recently-played",
        "playlist-read-private",
        "user-read-email",
        "user-read-private"
        ].join(" ")

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

        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration failed:", err);
                return res.status(500).send("Session error");
            }
        })

        // Store tokens in session (in-memory)
        req.session.spotify = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        };
        console.log("Spotify access token received");

        const user = await getSpotifyUser(req.session.spotify.accessToken); //TODO just use tokenData.accessToken?
        const jwtToken = issueJwt({ spotifyId: user.id });

        // Store JWT in an HttpOnly cookie so it can't be stolen via XSS
        res.cookie("auth_token", jwtToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.redirect("/"); // Redirect home
    } catch (err) {
        console.error("Spotify callback error:", err);
        res.status(500).send("Spotify callback failed");
    }
});

router.get("/auth/spotify/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).send("Logout failed");
        }

        res.clearCookie("connect.sid"); // default express-session cookie name
        res.clearCookie("auth_token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });
        res.redirect("/");
    });
});

router.get("/api/spotify/profile", requireAuth, async (req, res) => {
    const spotifyAccessToken = getSpotifyAccessToken(req);
    try {
        const profile = await getSpotifyProfile(spotifyAccessToken);
        res.json(profile);
    } catch (err) {
        console.error("Spotify profile error:", err);
        res.status(500).json({ error: "Spotify profile failed to load" });
    }
});

export default router;
