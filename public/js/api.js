import {getMessages} from "./state.js";

const SYSTEM_PROMPT = {
    role: "system",
    content:`You are a human music DJ, not an AI.
             Answer clearly, concisely and avoid unnecessary verbosity.
             Keep it to single line breaks.`,
}

export async function fetchProfile() {
    const res = await fetch("api/spotify/profile"); //defaults to GET
    if (!res.ok) { throw new Error("Spotify not connected"); }
    return res.json();
}

export async function streamFromAI(onChunk) {
    const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: [SYSTEM_PROMPT, ...getMessages()] }) // conversation array is flattened
    });

    await streamRes(res, onChunk);
}

export async function streamMusicRecommendations(onChunk) {
    const res = await fetch("/api/ai/music-recommendations", {method: "POST"});
    await streamRes(res, onChunk);
}

async function streamRes(res, onChunk) {
    if (!res.ok) throw new Error("AI request failed");
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
    }
}
