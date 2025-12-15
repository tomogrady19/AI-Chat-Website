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

        // // Most accurate & universal extraction for Responses API
        // const output =
        //   response.output_text ??
        //   response.output?.[0]?.content?.[0]?.text ?? // if nothing in .output_text
        //   "No text found in OpenAI response"; // if nothing found at all
        //
        // res.json({output: output}); // send the response back to the browser
    } catch (err) {
        console.error("OpenAI ERROR:", err); // terminal error for me
        res.status(500).end("OpenAI request failed"); // browser error for user
        // res.status(500).json({ error: "OpenAI request failed" }); // browser error for user
    }
});

app.listen(3000, () =>
    console.log("Running at http://localhost:3000")
);

// node index.js