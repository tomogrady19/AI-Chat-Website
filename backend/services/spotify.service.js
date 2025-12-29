import fetch from "node-fetch";
import crypto from "crypto";

export async function getSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.accessToken) {
        throw new Error("Spotify not authenticated");
    }

    const obtainedAt = spotifySession.obtainedAt || 0;
    const expiresInMs = (spotifySession.expiresIn || 3600) * 1000;
    const refreshAt = obtainedAt + expiresInMs - 60_000; //TODO 60_000???(why not 60000)

    if (!obtainedAt || Date.now() >= refreshAt) {
        await refreshSpotifyAccessToken(req);
    }

    return spotifySession.accessToken;
}

export async function getSpotifyProfile(accessToken, timeRange) {
    const headers = { Authorization: `Bearer ${accessToken}` };

    const [artistsRes, tracksRes, recentRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`, { headers }),
        fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`, { headers }),
        fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=10`, { headers })
    ]);

    return {
        artists: (await artistsRes.json()).items ?? [],
        tracks: (await tracksRes.json()).items ?? [],
        recent: (await recentRes.json()).items ?? [],
    };
}

// User call so we can tie each JWT to a Spotify account
export async function getSpotifyUser(accessToken) {
    const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!spotifyRes.ok) {
        const body = await spotifyRes.text();
        throw new Error(`Spotify ID call failed: ${spotifyRes.status} ${body}`);
    }

    return spotifyRes.json();
}

export function redirectToSpotifyAuth(req, res, { forceDialog = false } = {}) {
    const state = crypto.randomBytes(16).toString("hex"); //randomise state so callback can be verified
    req.session.spotifyState = state; //store state in server side session

    // request permissions from Spotify
    const scope = [
        "user-top-read",
        "user-read-recently-played",
        "playlist-read-private",
        "user-read-email",
        "user-read-private",
        "streaming",
        "user-read-playback-state",
        "user-modify-playback-state"
    ].join(" ");

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state
    });

    if (forceDialog) {
        params.set("show_dialog", "true");
    }

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export function getTimeRange(req) {
    const allowedRanges = new Set(["short_term", "medium_term", "long_term"]);
    const requested =
        req.body?.timeRange ??
        req.query?.timeRange;
    return allowedRanges.has(requested) ? requested : "medium_term";
}

async function refreshSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.refreshToken) {
        throw new Error("Spotify refresh token missing");
    }

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: spotifySession.refreshToken
        })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
        throw new Error(`Spotify refresh failed: ${tokenRes.status} ${JSON.stringify(tokenData)}`);
    }

    spotifySession.accessToken = tokenData.access_token;
    spotifySession.expiresIn = tokenData.expires_in;
    spotifySession.obtainedAt = Date.now();
}
