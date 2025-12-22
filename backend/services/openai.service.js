import OpenAI from "openai";
import { handleOpenAIError } from "../utils/openaiError.js";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function streamAIResponse({ input, req, res }) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const abortController = new AbortController(); // used to make sure streaming stops when user disconnects
    let stream;

    req.on("close", () => {abortController.abort();});

    try {
        stream = await client.responses.stream({
            model: "gpt-4o-mini",
            input: input,
            signal: abortController.signal
        });
    } catch (err) {
        handleOpenAIError(err, req, res);
    }

    let closed = false;
    try {
        for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
                res.write(event.delta);
            }
            if (event.type === "response.completed") {
                closed = true;
                res.end();
            }
        }
    } catch (err) {
        if (!closed){
            res.write("\n\n[Error generating response]");
            res.end(); // ensure the response is always closed, even if there's an error
        }
    }
}
