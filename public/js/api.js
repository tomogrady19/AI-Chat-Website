import {getMessages} from "./state.js";

const SYSTEM_PROMPT = {
    role: "system",
    content: "Respond like a human, not like an AI. Answer clearly, concisely and avoid unnecessary verbosity.",
}

export async function sendMessageToAI() {
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: [SYSTEM_PROMPT, ...getMessages()] }) // array is flattened
    });

    if (!res.ok) {
        throw new Error("API request failed");
    }

    const data = await res.json(); //extract data from json response
    return data.output;
}