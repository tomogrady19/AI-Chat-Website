import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redirectToSpotifyAuth } from "../services/spotify.service.js";
import { spotifyCallback, spotifyStatus, getProfile, getPlaybackToken, logout } from '../controllers/spotify.controller.js'

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

export default router;
