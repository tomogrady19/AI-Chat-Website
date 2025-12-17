import {getMessages} from "./state.js";

const SYSTEM_PROMPT = {
    role: "system",
    content: "Respond like a human, not like an AI. Answer clearly, concisely and avoid unnecessary verbosity. Don't leave more than one blank line between text. Speak like a pirate.",
}

export async function streamFromAI(onChunk) {
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: [SYSTEM_PROMPT, ...getMessages()] }) // conversation array is flattened
    });

    if (!res.ok) {
        throw new Error("API request failed");
    }

    // allow chunks to be pulled and decoded
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const {value, done} = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, {stream: true});
        onChunk(chunk);
    }
}

export async function fetchTopArtists() {
    const res = await fetch("/api/spotify/top-artists");

    if (!res.ok) {
        throw new Error("Spotify not connected");
    }

    return res.json();
}

export async function fetchTopTracks() {
    const res = await fetch("/api/spotify/top-tracks");

    if (!res.ok) {
        throw new Error("Spotify not connected");
    }

    return res.json();
}

//TODO combine artists and tracks into one function?

export async function streamMusicRecommendations(onChunk) {
    const res = await fetch("/api/ai/music-recommendations", {
        method: "POST",
    });

    if (!res.ok) throw new Error("AI request failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        onChunk(decoder.decode(value));
    }
}
