import { getMessages } from "./state.js";

export async function sendMessageToAI() {
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: getMessages() })
    });

    if (!res.ok) {
        throw new Error("API request failed");
    }

    const data = await res.json(); //extract data from json response
    return data.output;
}
