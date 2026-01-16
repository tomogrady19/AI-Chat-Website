import crypto from "crypto";

export function setAuthCookie(res, jwtToken) {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth_token", jwtToken, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        ...(isProd && { domain: ".spotify-insights.com" }),
        path: "/",
        secure: isProd,
        maxAge: 60 * 60 * 1000,
    });
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