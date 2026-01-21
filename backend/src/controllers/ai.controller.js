import { getSpotifyAccessToken } from "../services/spotify/spotifyAuth.service.js";
import { getSpotifyProfile } from "../services/spotify/spotifyProfile.service.js";
import { getTimeRange } from "../services/spotify/spotifyUtils.js";
import { buildMusicProfilePrompt } from '../utils/prompts.js'
import { SYSTEM_PROMPT } from '../utils/prompts.js' //TODO move to config/constants.js ?
import { streamAIResponse } from '../services/openai.service.js'
import { requireAuth } from "../middleware/auth.js";

export async function askAI(req, res) {
    const timeRange = getTimeRange(req);
    const mode = req.query.mode === "demo" ? "demo" : "live";
    let spotifyAccessToken = null;
    if (mode !== "demo") {
        await requireAuth(req);
        spotifyAccessToken = await getSpotifyAccessToken(req);
    }
    const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, mode);
    const musicContext = { role: "system", content: buildMusicProfilePrompt(profile) };
    const conversation = [...req.body.conversation];
    const input = [SYSTEM_PROMPT, musicContext, ...conversation];
    await streamAIResponse({ input: input, req, res });
}