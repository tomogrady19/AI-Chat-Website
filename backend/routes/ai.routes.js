import express from "express";
import { streamAIResponse } from "../services/openai.service.js";
import { getSpotifyAccessToken, getSpotifyProfile } from "../services/spotify.service.js";
import { buildMusicProfilePrompt } from "../utils/prompts.js";
import { requireAuth } from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";
import { askSchema } from "../validators/askSchema.js";

const router = express.Router();

router.post("/ask", validate(askSchema), requireAuth, async (req, res) => {
    try {
        await streamAIResponse({input: req.body.conversation, res});
    } catch (err) {
        console.error(err);
        res.status(500).end("AI ask failed");
    }
});

router.post("/music-recommendations", validate(askSchema), requireAuth, async (req, res) => {
    try {
        const spotifyAccessToken = getSpotifyAccessToken(req);
        const profile = await getSpotifyProfile(spotifyAccessToken);
        const prompt = buildMusicProfilePrompt(profile);

        await streamAIResponse({ input: prompt, res });
    } catch (err) {
        console.error(err);
        res.status(500).end("AI recommendation failed");
    }
});

export default router;
