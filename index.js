console.log("SERVER STARTED", Date.now());

import OpenAI from "openai";
import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import session from "express-session";
import crypto from "crypto";

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

    //debugging
    console.log("state:", state);
    console.log("ID:", req.sessionID);

});

app.get("/auth/spotify/callback", (req, res) => {
    const { code, state } = req.query;

    //debugging
    console.log("state:", state);
    console.log("ID:", req.sessionID);
    console.log("spotify state:", req.session.spotifyState);

    if (!state || state !== req.session.spotifyState) {
        return res.status(400).send("State mismatch");
    }

    // temporary message
    res.send("Spotify auth successful");
});


app.listen(3000, () =>
    console.log("Running at http://127.0.0.1:3000")
);

console.log("Test Spotify OAuth at http://127.0.0.1:3000/auth/spotify/login");
// node index.js
