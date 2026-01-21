// This file only knows Spotify URLs and headers and speaks directly to Spotify endpoints
import fetch from "node-fetch";
import { spotifyFetch, spotifyTokenRequest } from "./spotifyUtils.js";

// User call so we can tie each JWT to a Spotify account
export async function getSpotifyUser(accessToken) {
    return spotifyFetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
}

export async function refreshSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.refreshToken) {
        const err = new Error("Spotify refresh token missing");
        err.status = 401;
        err.expose = true;
        throw err;
    }

    const { res, data } = await spotifyTokenRequest({
        grant_type: "refresh_token",
        refresh_token: spotifySession.refreshToken
    });

    if (!tokenRes.ok) {
        const err = new Error("Spotify token refresh failed");
        err.status = tokenRes.status === 401 ? 401 : 502;
        err.expose = tokenRes.status === 401;
        throw err;
    }


    spotifySession.accessToken = data.access_token;
    spotifySession.expiresIn = data.expires_in;
    spotifySession.obtainedAt = Date.now();
}

export async function exchangeCodeForSpotifyTokens(code) {
    const { res, data } = await spotifyTokenRequest({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    });

    if (!res.ok) {
        // Spotify OAuth failures that are part of normal control flow
        if (tokenResponse.status === 400 || tokenResponse.status === 401) {
            return null;
        }

        // Spotify auth service failure
        const err = new Error("Spotify token exchange failed");
        err.status = 502;
        err.expose = false;
        throw err;
    }

    return data;
}