import fetch from "node-fetch";

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
