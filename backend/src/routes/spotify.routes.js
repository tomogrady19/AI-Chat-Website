import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { clearCookies } from "../services/session.service.js";
import { redirectToSpotifyAuth } from "../services/spotify.service.js";
import { spotifyCallback, spotifyStatus, getProfile, getPlaybackToken } from '../controllers/spotify.controller.js'

const router = express.Router();

router.get("/status", spotifyStatus);

router.get("/profile", getProfile);

router.get("/playback-token", requireAuth, getPlaybackToken);

router.get("/callback", spotifyCallback);

router.get("/login", (req, res) => {
    redirectToSpotifyAuth(req, res);
});

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).send("Logout failed");
        }

        clearCookies(res);
        res.status(200).json({ success: true });
    });
});

router.get("/switch", (req, res) => {
    redirectToSpotifyAuth(req, res, { forceDialog: true });
});

export default router;
