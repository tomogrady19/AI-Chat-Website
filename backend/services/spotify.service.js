import fetch from "node-fetch";

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
