import express from "express";
import rateLimiter from "../middleware/rateLimiter.js";
import { streamAIResponse } from "../services/openai.service.js";
import { getSpotifyProfile } from "../services/spotify.service.js";
import { buildMusicProfilePrompt } from "../utils/prompts.js";

const router = express.Router();

router.post("/ask", rateLimiter, async (req, res) => {
  try {
    await streamAIResponse({
      input: req.body.conversation,
      res
    });
  } catch (err) {
    console.error(err);
    res.status(500).end("AI ask failed");
  }
});

router.post("/music-recommendations", async (req, res) => {
  try {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.accessToken) {
      return res.status(401).end("Spotify not connected");
    }

    const profile = await getSpotifyProfile(spotifySession.accessToken);
    const prompt = buildMusicProfilePrompt(profile);
    await streamAIResponse({ input: prompt, res });

  } catch (err) {
    console.error(err);
    res.status(500).end("AI recommendation failed");
  }
});

export default router;
