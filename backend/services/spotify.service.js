import fetch from "node-fetch";
import crypto from "crypto";

export function getSpotifyAccessToken(req) {
    const spotifySession = req.session.spotify;
    if (!spotifySession?.accessToken) {
        throw new Error("Spotify not authenticated");
    }
    return spotifySession.accessToken;
}

export async function getSpotifyProfile(accessToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };

    const [artistsRes, tracksRes, recentRes] = await Promise.all([
        fetch("https://api.spotify.com/v1/me/top/artists?limit=10", { headers }),
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", { headers }),
        fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", { headers })
    ]);

    return {
        artists: (await artistsRes.json()).items,
        tracks: (await tracksRes.json()).items,
        recent: (await recentRes.json()).items
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

    // request info needed from Spotify
    const scope = [
        "user-top-read",
        "user-read-recently-played",
        "playlist-read-private",
        "user-read-email",
        "user-read-private"
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
