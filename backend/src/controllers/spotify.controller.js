import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser, getTimeRange, exchangeCodeForSpotifyTokens, validateSpotifyState, buildSpotifySession, setAuthCookie} from "../services/spotify.service.js";
import { regenerateSession, clearCookies, destroySession } from "../services/session.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

export async function spotifyCallback(req, res, next) {
    if (!validateSpotifyState(req)) {
        return res.redirect(`${frontendUrl}?callback=failed`);
    }

    const tokens = await exchangeCodeForSpotifyTokens(req.query.code);
    if (!tokens) {
        return res.redirect(`${frontendUrl}?callback=failed`);
    }

    await regenerateSession(req);
    req.session.spotify = buildSpotifySession(tokens);

    const user = await getSpotifyUser(tokens.access_token);
    const jwtToken = issueJwt({ spotifyId: user.id });
    setAuthCookie(res, jwtToken);

    res.redirect(frontendUrl);
}

export async function spotifyStatus(req, res, next) {
    const token = await getSpotifyAccessToken(req);
    if (!token){
        return res.json({ authenticated: false });
    }
    const user = await getSpotifyUser(req.session.spotify.accessToken);
    return res.json({ authenticated: true, premium: user.product === "premium" });
}

export async function getProfile(req, res, next) { //TODO think about naming (getProfile and getSpotifyProfile are very similar)
    const timeRange = getTimeRange(req);
    const mode = req.query.mode;

    // demo mode: no auth, no token
    if (mode === "demo") {
        const profile = await getSpotifyProfile(null, timeRange, "demo");
        return res.json(profile);
    }

    // live mode: auth required
    const user = await requireAuth(req);
    const spotifyAccessToken = await getSpotifyAccessToken(req);
    const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, "live");
    return res.json(profile);
}

export async function getPlaybackToken(req, res, next){
    await requireAuth(req);
    const accessToken = await getSpotifyAccessToken(req);
    res.json({ accessToken });
}

export async function logout(req, res) {
    await destroySession(req);
    clearCookies(res);
    return res.json({ success: true });
}