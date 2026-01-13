import express from "express";
import fetch from "node-fetch";
import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser, redirectToSpotifyAuth, getTimeRange} from "../services/spotify.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";

router.get("/login", (req, res) => {
    redirectToSpotifyAuth(req, res);
});

const frontendUrl = process.env.FRONTEND_URL;

router.get("/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!state || state !== req.session.spotifyState) {
        return res.status(400).send("State mismatch"); //TODO handle this error better
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
            sameSite: isProd ? "none" : "lax",
            ...(isProd && { domain: ".spotify-insights.com" }),
            path: "/",
            secure: isProd,
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.redirect(frontendUrl);
    } catch (err) {
        console.warn(`[${req.id}] Spotify callback error:`, err);
        return res.redirect(`${frontendUrl}?callback=failed`);
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).send("Logout failed");
        }

        res.clearCookie("sid", {
            sameSite: isProd ? "none" : "lax",
            ...(isProd && { domain: ".spotify-insights.com" }),
            path: "/",
            secure: isProd
        });

        res.clearCookie("auth_token", {
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            ...(isProd && { domain: ".spotify-insights.com" }),
            path: "/",
            secure: isProd
        });
        res.status(200).json({ success: true });
    });
});

router.get("/switch", (req, res) => {
    redirectToSpotifyAuth(req, res, { forceDialog: true });
});

router.get("/status", async (req, res) => {
    try {
        await getSpotifyAccessToken(req);
        const user = await getSpotifyUser(req.session.spotify.accessToken);
        return res.json({ authenticated: true, premium: user.product === "premium" });
    } catch (err) {
        return res.json({ authenticated: false });
    }
});

router.get("/profile", async (req, res) => {
    const timeRange = getTimeRange(req);
    const mode = req.query.mode;

    // demo mode: no auth, no token
    if (mode === "demo") {
        try {
            const profile = await getSpotifyProfile(null, timeRange, "demo");
            return res.json(profile);
        } catch (err) {
            console.error("Demo profile error:", err);
            return res.status(500).json({ error: "Demo profile failed to load" });
        }
    }

    // live mode: auth required
    return requireAuth(req, res, async () => {
        try {
            const spotifyAccessToken = await getSpotifyAccessToken(req);
            const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, "live");
            res.json(profile);
        } catch (err) {
            if (err?.status === 401) {
                return res.status(401).json({ error: err.message });
            }
            console.error("Spotify profile error:", err);
            res.status(500).json({ error: "Spotify profile failed to load" });
        }
    });
});

router.get("/playback-token", requireAuth, async (req, res) => {
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
