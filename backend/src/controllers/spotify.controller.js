import { getSpotifyAccessToken, validateSpotifyState, buildSpotifySession } from "../services/spotify/spotifyAuth.service.js";
import { getSpotifyProfile } from "../services/spotify/spotifyProfile.service.js";
import { getSpotifyUser, exchangeCodeForSpotifyTokens } from "../services/spotify/spotifyClient.service.js";
import { setAuthCookie } from "../services/spotify/spotifySession.service.js";
import { getTimeRange } from "../services/spotify/spotifyUtils.js";
import { regenerateSession, clearCookies, destroySession } from "../services/session.service.js";
import { requireAuth } from "../middleware/auth.js";
import { issueJwt } from "../utils/jwt.js";

const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

export async function spotifyCallback(req, res) {
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

//TODO think of changing this function (return res.json(user) or res.json(null))
export async function spotifyUser(req, res) {
    if (req.query.mode === "demo") {
        return res.json({ authenticated: false, premium: false, display_name: "Demo User", images: []});
    }

    const accessToken = await getSpotifyAccessToken(req);
    if (!accessToken){
        return res.json({ authenticated: false, premium: false, display_name: null, images: [] });
    }

    const user = await getSpotifyUser(accessToken);
    return res.json({ authenticated: true, premium: user.product === "premium", display_name: user.display_name, images: user.images  });
}

export async function getProfile(req, res) { //TODO think about naming (getProfile and getSpotifyProfile are very similar)
    const timeRange = getTimeRange(req);
    const mode = req.query.mode;

    // demo mode: no auth, no token
    if (mode === "demo") {
        const profile = await getSpotifyProfile(null, timeRange, "demo"); //TODO I'm testing for mode her and in getSpotifyProfile -> redundant
        return res.json(profile);
    }

    // live mode: auth required
    await requireAuth(req);
    const spotifyAccessToken = await getSpotifyAccessToken(req);
    const profile = await getSpotifyProfile(spotifyAccessToken, timeRange, "live");
    return res.json(profile);
}

export async function getPlaybackToken(req, res){
    await requireAuth(req);
    const accessToken = await getSpotifyAccessToken(req);
    res.json({ accessToken });
}

export async function logout(req, res) {
    await destroySession(req);
    clearCookies(res);
    return res.json({ success: true });
}