import fetch from "node-fetch";

export function getTimeRange(req) {
    const allowedRanges = new Set(["short_term", "medium_term", "long_term"]);
    const requested =
        req.body?.timeRange ??
        req.query?.timeRange;
    return allowedRanges.has(requested) ? requested : "medium_term";
}

export async function spotifyFetch(url, options = {}) {
    const res = await fetch(url, options);

    if (!res.ok) {
        const err = new Error("Spotify API error");
        err.status = res.status === 401 ? 401 : 502;
        err.expose = res.status === 401;
        throw err;
    }

    return res.json();
}

export async function spotifyTokenRequest(bodyParams) {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
        },
        body: new URLSearchParams(bodyParams),
    });

    const data = await res.json();

    return { res, data };
}