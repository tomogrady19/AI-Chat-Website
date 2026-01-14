import express from "express";
import fetch from "node-fetch";
import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser, redirectToSpotifyAuth, getTimeRange, exchangeCodeForSpotifyTokens, validateSpotifyState, buildSpotifySession, setAuthCookie} from "../services/spotify.service.js";
import { regenerateSession } from "../services/session.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";

router.get("/login", (req, res) => {
    redirectToSpotifyAuth(req, res);
});

const frontendUrl = process.env.FRONTEND_URL;

router.get("/callback", async (req, res) => {
    try {
        validateSpotifyState(req);

        const tokens = await exchangeCodeForSpotifyTokens(req.query.code);
        await regenerateSession(req);
        req.session.spotify = buildSpotifySession(tokens);

        const user = await getSpotifyUser(tokens.access_token);
        const jwtToken = issueJwt({ spotifyId: user.id });
        setAuthCookie(res, jwtToken);

        res.redirect(frontendUrl);
    } catch (err) {
        console.warn("Spotify callback error:", err);
        res.redirect(`${frontendUrl}?callback=failed`);
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

router.get("/profile", async (req, res, next) => {
    const timeRange = getTimeRange(req);
    const mode = req.query.mode;

    // demo mode: no auth, no token
    if (mode === "demo") {
        try {
            const profile = await getSpotifyProfile(null, timeRange, "demo");
            return res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    // live mode: auth required
    return requireAuth(req, res, async () => {
        try {
            const spotifyAccessToken = await getSpotifyAccessToken(req);
            const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, "live");
            res.json(profile);
        } catch (err) {
            next(err);
        }
    });
});

router.get("/playback-token", requireAuth, async (req, res, next) => {
    try {
        const accessToken = await getSpotifyAccessToken(req);
        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
});


export default router;
