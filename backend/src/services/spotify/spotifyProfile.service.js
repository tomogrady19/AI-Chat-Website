import fetch from "node-fetch";
import { getDemoSpotifyProfile } from "./demo/spotifyDemoData.js";

export async function getSpotifyProfile(accessToken, timeRange, mode="live") {
    if (mode === "demo") {
        return getDemoSpotifyProfile();
    };

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

export async function getSpotifyUser(accessToken) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Spotify /v1/me failed (${res.status}): ${errorBody || res.statusText}`);
    }

    return res.json();
}