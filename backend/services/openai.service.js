import OpenAI from "openai";
import { handleOpenAIError } from "../utils/openaiError.js";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function streamAIResponse({ input, res }) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
        const stream = await client.responses.stream({
        model: "gpt-4o-mini",
        input: input
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
        handleOpenAIError(err, res);
    }
}
