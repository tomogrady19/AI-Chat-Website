// This file only knows Spotify URLs and headers and speaks directly to Spotify endpoints
import fetch from "node-fetch";

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

export async function refreshSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.refreshToken) {
        const err = new Error("Spotify refresh token missing");
        err.status = 401;
        throw err;
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

export async function exchangeCodeForSpotifyTokens(code) {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization":
                "Basic " +
                Buffer.from(
                process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        if (tokenResponse.status >= 500) {
            throw new Error('Spotify token service unavailable'); //TODO should this error be formatted differently?
        }
        return null;
    }

    return tokenData;
}