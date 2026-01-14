import express from "express";
import { streamAIResponse } from "../services/openai.service.js";
import { getSpotifyAccessToken, getSpotifyProfile, getTimeRange } from "../services/spotify.service.js";
import { buildMusicProfilePrompt, SYSTEM_PROMPT } from "../utils/prompts.js";

import { validate } from "../middleware/validate.js";
import { askSchema } from "../validators/askSchema.js";

const router = express.Router();

router.post("/ask", validate(askSchema), async (req, res) => {
    const timeRange = getTimeRange(req);
    const mode = req.query.mode === "demo" ? "demo" : "live";
    let spotifyAccessToken = null;
    try {
        if (mode !== "demo") {
            spotifyAccessToken = await getSpotifyAccessToken(req);
        }
        const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, req.query.mode);
        const musicContext = { role: "system", content: buildMusicProfilePrompt(profile) };
        const conversation = [...req.body.conversation];
        const input = [SYSTEM_PROMPT, musicContext, ...conversation];
        await streamAIResponse({ input: input, req, res });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI ask failed" });
    }
});

export default router;
