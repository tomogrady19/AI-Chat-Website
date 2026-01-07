import express from "express";
import { streamAIResponse } from "../services/openai.service.js";
import { getSpotifyAccessToken, getSpotifyProfile, getTimeRange } from "../services/spotify.service.js";
import { buildMusicProfilePrompt } from "../utils/prompts.js";
import { requireAuth } from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";
import { askSchema } from "../validators/askSchema.js";

const router = express.Router();

router.post("/ask", validate(askSchema), async (req, res) => {
    try {
        await streamAIResponse({input: req.body.conversation, req, res});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI ask failed" });
    }
});

router.post("/music-recommendations", async (req, res) => {
    const timeRange = getTimeRange(req);
    const mode = req.query.mode === "demo" ? "demo" : "live";
    let spotifyAccessToken = null;
    try {
        if (mode !== "demo") {
            spotifyAccessToken = await getSpotifyAccessToken(req);
        }
        const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, req.query.mode);
        const prompt = buildMusicProfilePrompt(profile);

        await streamAIResponse({ input: prompt, req, res });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI recommendation failed"});
    }
});

export default router;
