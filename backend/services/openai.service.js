import OpenAI from "openai";
import { handleOpenAIError } from "../utils/openaiError.js";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// Streaming response to avoid long waits and allow early disconnects (also looks cooler)
export async function streamAIResponse({ input, req, res }) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const abortController = new AbortController(); // used to make sure streaming stops when user disconnects
    let stream;

    req.on("close", () => {
        console.info(`[${req.id}] Client disconnected`);
        abortController.abort();
    });

    try {
        stream = await client.responses.stream({
            model: "gpt-4o-mini",
            input: input,
            signal: abortController.signal
        });
    } catch (err) {
        if (abortController.signal.aborted) {
            console.info(`[${req.id}] OpenAI request aborted`);
            return;
        }
        handleOpenAIError(err, req, res);
        return;
    }

    let closed = false;
    try {
        for await (const event of stream) {
            if (abortController.signal.aborted) {
                return;
            }
            if (event.type === "response.output_text.delta") {
                res.write(event.delta);
            }
            if (event.type === "response.completed") {
                console.info(`[${req.id}] Response completed`);
                closed = true;
                res.end();
            }
        }
    } catch (err) {
        if (!closed && !res.writableEnded){ // if the stream isn't closed and the response isn't closed
            res.write("\n\n[Error generating response]");
            res.end(); // ensure the response is always closed, even if there's an error
        }
    }
}
