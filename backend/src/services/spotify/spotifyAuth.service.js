import { refreshSpotifyAccessToken } from "./spotifyClient.service.js";

export function validateSpotifyState(req) {
    const { state } = req.query;

    if (!state || state !== req.session.spotifyState) {
        return false;
    }

    delete req.session.spotifyState;
    return true;
}

export function buildSpotifySession(tokenData) {
    return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        obtainedAt: Date.now(),
    };
}

// This function shouldn't raise an error as this just means user is logged out
export async function getSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.accessToken) {
        return null;
    }

    const obtainedAt = spotifySession.obtainedAt || 0;
    const expiresInMs = (spotifySession.expiresIn || 3600) * 1000;
    const refreshAt = obtainedAt + expiresInMs - 60_000; // Refresh 1 minute early to ensure refresh happens in time

    if (!obtainedAt || Date.now() >= refreshAt) {
        await refreshSpotifyAccessToken(req);
    }
    return spotifySession.accessToken;
}