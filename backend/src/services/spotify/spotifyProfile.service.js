import fetch from "node-fetch";
import { getDemoSpotifyProfile } from "./demo/spotifyDemoData.js";
import { spotifyFetch } from "./spotifyUtils.js";

export async function getSpotifyProfile(accessToken, timeRange, mode="live") {
    if (mode === "demo") {
        return getDemoSpotifyProfile();
    };

    const headers = { Authorization: `Bearer ${accessToken}` };

    const [artists, tracks, recent] = await Promise.all([
        spotifyFetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`, { headers }),
        spotifyFetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`, { headers }),
        spotifyFetch(`https://api.spotify.com/v1/me/player/recently-played?limit=10`, { headers })
    ]);

    return {
        artists: artists.items ?? [],
        tracks: tracks.items ?? [],
        recent: recent.items ?? [],
    };
}

export async function getSpotifyUser(accessToken) {
    return spotifyFetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
}