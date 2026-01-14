import {getSpotifyAccessToken, getSpotifyProfile, getSpotifyUser, redirectToSpotifyAuth, getTimeRange, exchangeCodeForSpotifyTokens, validateSpotifyState, buildSpotifySession, setAuthCookie} from "../services/spotify.service.js";
import { regenerateSession, clearCookies } from "../services/session.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

export async function spotifyCallback(req, res, next) {
    try {
        validateSpotifyState(req);

        const tokens = await exchangeCodeForSpotifyTokens(req.query.code);
        await regenerateSession(req);
        req.session.spotify = buildSpotifySession(tokens);

        const user = await getSpotifyUser(tokens.access_token);
        const jwtToken = issueJwt({ spotifyId: user.id });
        setAuthCookie(res, jwtToken);

        res.redirect(frontendUrl);
    } catch (err) {
        console.warn("Spotify callback error:", err);
        res.redirect(`${frontendUrl}?callback=failed`);
    }
}

export async function spotifyStatus(req, res, next) {
    try {
        //TODO figure out which function throws an error when not logged in and try to avoid in so that asyncHandler can be used
        await getSpotifyAccessToken(req);
        const user = await getSpotifyUser(req.session.spotify.accessToken);
        return res.json({ authenticated: true, premium: user.product === "premium" });
    } catch (err) {
        return res.json({ authenticated: false });
    }
}

export async function getProfile(req, res, next) { //TODO think about naming (getProfile and getSpotifyProfile are very similar)
    const timeRange = getTimeRange(req);
    const mode = req.query.mode;

    // demo mode: no auth, no token
    if (mode === "demo") {
        try {
            const profile = await getSpotifyProfile(null, timeRange, "demo");
            return res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    // live mode: auth required
    return requireAuth(req, res, async () => {
        try {
            const spotifyAccessToken = await getSpotifyAccessToken(req);
            const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, "live");
            res.json(profile);
        } catch (err) {
            next(err);
        }
    });
}

export async function getPlaybackToken(req, res, next){
    try {
        const accessToken = await getSpotifyAccessToken(req);
        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
}