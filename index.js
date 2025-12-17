import OpenAI from "openai";
import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import session from "express-session";
import crypto from "crypto";
import fetch from "node-fetch";

const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(session({secret: "dev-secret-change-later", resave: false, saveUninitialized: false, cookie: {sameSite: "lax"}}));
app.use(express.json()); // allows server to understand json files
app.use(express.static("public")); // serves your frontend files in the "public" folder

app.post("/api/ask", rateLimiter, async (req, res) => {
    try {
        // extract conversation from json file
        const conversation = req.body.conversation;

        res.setHeader("Content-Type", "text/plain; charset=utf-8"); // since response isn't json
        res.setHeader("Transfer-Encoding", "chunked"); // response will come in chunks

        // construct input, then send openai api and stream response
        const input = {model: "gpt-4o-mini", input: conversation}
        const stream = await client.responses.stream(input); // stream response

        for await (const event of stream){
            if (event.type === "response.output_text.delta") {
                res.write(event.delta);
            }
            if (event.type === "response.completed") {
                res.end();
            }
        }
    } catch (err) {
        console.error("OpenAI ERROR:", err); // terminal error for me
        res.status(500).end("OpenAI request failed"); // browser error for user
    }
});

app.get("/auth/spotify/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.spotifyState = state;

    const scope = [
        "user-top-read",
        "playlist-read-private",
        "playlist-read-collaborative"
        ].join(" ");

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/auth/spotify/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!state || state !== req.session.spotifyState) {
        return res.status(400).send("State mismatch");
    }

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),},
                body: new URLSearchParams({grant_type: "authorization_code", code, redirect_uri: process.env.SPOTIFY_REDIRECT_URI,}),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Spotify token error:", tokenData);
            return res.status(500).send("Token exchange failed");
        }

        // Store tokens in session (in-memory)
        req.session.spotify = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        };
        console.log("Spotify access token received");

        // Cleanup one-time state
        delete req.session.spotifyState;

        // For now, redirect home
        res.redirect("/");
    } catch (err) {
        console.error("Token exchange error:", err);
        res.status(500).send("Spotify authentication failed");
    }
});

app.get("/api/spotify/top-artists", async (req, res) => {
    const spotifySession = req.session.spotify;

    if (!spotifySession?.accessToken) {
        return res.status(401).json({error: "Not authenticated with Spotify"});
    }

    try {
        const response = await fetch(
            "https://api.spotify.com/v1/me/top/artists?limit=10",
            {headers: {Authorization: `Bearer ${spotifySession.accessToken}`,},}
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Spotify API error:", data);
            return res.status(500).json({ error: "Spotify API request failed" });
        }

        res.json(data);
    } catch (err) {
        console.error("Spotify request error:", err);
        res.status(500).json({ error: "Spotify request failed" });
    }
});

app.get("/api/spotify/top-tracks", async (req, res) => {
    const spotifySession = req.session.spotify;

    if (!spotifySession?.accessToken) {
        return res.status(401).json({error: "Not authenticated with Spotify"});
    }

    try {
        const response = await fetch(
            "https://api.spotify.com/v1/me/top/tracks?limit=10",
            {headers: {Authorization: `Bearer ${spotifySession.accessToken}`,},}
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Spotify API error:", data);
            return res.status(500).json({ error: "Spotify API request failed" });
        }

        res.json(data);
    } catch (err) {
        console.error("Spotify request error:", err);
        res.status(500).json({ error: "Spotify request failed" });
    }
});

//TODO can I avoid repeating some of the code twice?

app.get("/api/spotify/profile", async (req, res) => {
    const spotifySession = req.session.spotify;

    if (!spotifySession?.accessToken) {
        return res.status(401).json({ error: "Not authenticated with Spotify" });
    }

    try {
        const headers = {Authorization: `Bearer ${spotifySession.accessToken}`,};

        const [artistsRes, tracksRes] = await Promise.all([
            fetch("https://api.spotify.com/v1/me/top/artists?limit=10", { headers }),
            fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", { headers }),
        ]);

        const artistsData = await artistsRes.json();
        const tracksData = await tracksRes.json();

        res.json({
            artists: artistsData.items,
            tracks: tracksData.items,
        });
    } catch (err) {
        console.error("Spotify profile error:", err);
        res.status(500).json({ error: "Failed to load Spotify profile" });
    }
});

app.post("/api/ai/music-recommendations", async (req, res) => {
    try {
        const spotifySession = req.session.spotify;

        if (!spotifySession?.accessToken) {
            return res.status(401).end("Spotify not connected");
        }

        const profileRes = await fetch(
            "http://127.0.0.1:3000/api/spotify/profile",
            { headers: { cookie: req.headers.cookie } }
        );

        const profile = await profileRes.json();

        const prompt = buildMusicProfilePrompt(profile); //where to put this function?

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        const stream = await client.responses.stream({
            model: "gpt-4o-mini",
            input: prompt,
        });

        for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
                res.write(event.delta);
            }
            if (event.type === "response.completed") {
                res.end();
            }
        }
    } catch (err) {
        console.error("AI music error:", err);
        res.status(500).end("AI recommendation failed");
    }
});

function buildMusicProfilePrompt({ artists, tracks }) {
    const artistNames = artists.map(a => a.name).join(", ");
    const genres = [
        ...new Set(artists.flatMap(a => a.genres))
    ].slice(0, 10);

    const trackSummaries = tracks.map(
        t => `${t.name} by ${t.artists.map(a => a.name).join(", ")}`
    );

    return `
        Please format your response with:
        - Clear section headings
        - One artist or song per line
        - Blank lines between sections
        
        The user’s music taste is based on Spotify listening data.
        Top artists: ${artistNames}
        Common genres: ${genres.join(", ")}
        Top tracks: ${trackSummaries.join("\n")}
        
        Based on this, respond with the following format:
        "Based on your music taste, here are some recommendations!"/n
        Artists you might like:/n
        {list 5 artists here (new line for each artist)}/n
        Tracks you might like:/n
        {list 5 tracks here (new line for each track)}/n
        
        {Give a brief one sentence explanation of what these recommendations have in common with their taste}/n
        {Offer to answer any follow up questions they have}/n
        `;
}


app.listen(3000, () =>
    console.log("Running at http://127.0.0.1:3000")
);

console.log("Test Spotify OAuth at http://127.0.0.1:3000/auth/spotify/login");
console.log("Look at top artists at http://127.0.0.1:3000/api/spotify/top-artists");

// node index.js
