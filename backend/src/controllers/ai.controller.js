import { getSpotifyAccessToken } from '../services/spotify.service.js' //TODO should this be in spotify.service.js ?
import { getSpotifyProfile, getTimeRange } from '../services/spotify.service.js'
import { buildMusicProfilePrompt } from '../utils/prompts.js'
import { SYSTEM_PROMPT } from '../utils/prompts.js' //TODO should this be in config/constants.js ?
import { streamAIResponse } from '../services/openai.service.js'

export async function askAI(req, res, next) {
    try {
        const timeRange = getTimeRange(req);
        const mode = req.query.mode === "demo" ? "demo" : "live";
        let spotifyAccessToken = null;
        if (mode !== "demo") {
            spotifyAccessToken = await getSpotifyAccessToken(req);
        }
        const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, req.query.mode);
        const musicContext = { role: "system", content: buildMusicProfilePrompt(profile) };
        const conversation = [...req.body.conversation];
        const input = [SYSTEM_PROMPT, musicContext, ...conversation];
        await streamAIResponse({ input: input, req, res });
    } catch (err) {
        next(err);
    }
}