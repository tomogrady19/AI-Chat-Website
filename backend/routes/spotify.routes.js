import express from "express";
import fetch from "node-fetch";
import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser, redirectToSpotifyAuth, getTimeRange} from "../services/spotify.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const router = express.Router();

router.get("/auth/spotify/login", (req, res) => {
    redirectToSpotifyAuth(req, res);
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

        await new Promise((resolve, reject) => {
            req.session.regenerate(err => {
              if (err) reject(err);
              else resolve();
            });
          });

        // Store tokens in session (in-memory)
        req.session.spotify = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            obtainedAt: Date.now()
        };
        console.info(`[${req.id}] Spotify access token received`);

        const user = await getSpotifyUser(req.session.spotify.accessToken);
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

router.get("/auth/spotify/switch", (req, res) => {
    redirectToSpotifyAuth(req, res, { forceDialog: true });
});

router.get("/auth/spotify/status", requireAuth, async (req, res) => {
    try {
        await getSpotifyAccessToken(req);
        res.json({ authenticated: true });
    } catch (err) {
        res.status(401).json({ authenticated: false });
    }
});

router.get("/api/spotify/profile", requireAuth, async (req, res) => {
    const timeRange = getTimeRange(req);
    try {
        const spotifyAccessToken = await getSpotifyAccessToken(req);
        const profile = await getSpotifyProfile(spotifyAccessToken, timeRange);
        res.json(profile);
    } catch (err) {
        if (err?.status === 401) {
            return res.status(401).json({ error: err.message });
        }
        console.error("Spotify profile error:", err);
        res.status(500).json({ error: "Spotify profile failed to load" });
    }
});

router.get("/api/spotify/playback-token", requireAuth, async (req, res) => {
    try {
        const accessToken = await getSpotifyAccessToken(req);
        res.json({ accessToken });
    } catch (err) {
        if (err?.status === 401) {
            return res.status(401).json({ message: "Spotify token unavailable" });
        }
        console.error("Playback token error:", err);
        res.status(500).json({ message: "Failed to fetch playback token" });
    }
});


export default router;
