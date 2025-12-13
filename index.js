import OpenAI from "openai";
import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";

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
app.use(express.json()); // allows server to understand json files
app.use(express.static("public")); // serves your frontend files

app.post("/api/ask", rateLimiter, async (req, res) => {
    try {
        // extract prompt from json file
        const conversation = req.body.conversation;


        // get response from openai api
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          input: conversation
        });

        // Most accurate & universal extraction for Responses API
        const output =
          response.output_text ??
          response.output?.[0]?.content?.[0]?.text ?? // if nothing in output text
          "No text found in OpenAI response"; // if nothing found at all

        res.json({ output: output }); // send the response back to the browser
    } catch (err) {
        console.error("OpenAI ERROR:", err); // terminal error for me
        res.status(500).json({ error: "OpenAI request failed" }); // browser error for user
    }
});

app.listen(3000, () =>
    console.log("Running at http://localhost:3000")
);

// node index.js