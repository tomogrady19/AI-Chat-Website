import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redirectToSpotifyAuth } from "../services/spotify/spotifySession.service.js";
import { spotifyCallback, spotifyStatus, getProfile, getPlaybackToken, logout, getMe } from '../controllers/spotify.controller.js'

const router = express.Router();

router.get("/status", asyncHandler(spotifyStatus));

router.get("/profile", asyncHandler(getProfile));

router.get("/playback-token", asyncHandler(getPlaybackToken));

router.get("/callback", asyncHandler(spotifyCallback));

router.get('/login', redirectToSpotifyAuth); //this is synchronous so no asyncHandler here

router.get("/logout", asyncHandler(logout));

router.get('/switch', (req, res) => {
  redirectToSpotifyAuth(req, res, { forceDialog: true });
});

router.get("/me", asyncHandler(getMe));

export default router;
