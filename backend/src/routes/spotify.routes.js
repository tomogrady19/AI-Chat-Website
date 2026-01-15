import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { clearCookies } from "../services/session.service.js";
import { redirectToSpotifyAuth } from "../services/spotify.service.js";
import { spotifyCallback, spotifyStatus, getProfile, getPlaybackToken, logout } from '../controllers/spotify.controller.js'

const router = express.Router();

router.get("/status", spotifyStatus);

router.get("/profile", getProfile);

router.get("/playback-token", requireAuth, getPlaybackToken);

router.get("/callback", spotifyCallback);

router.get('/login', redirectToSpotifyAuth); //this is synchronous so no asyncHandler here

router.get("/logout", logout);

router.get('/switch', (req, res) => {
  redirectToSpotifyAuth(req, res, { forceDialog: true });
});

export default router;
