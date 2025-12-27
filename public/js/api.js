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
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Request failed (${res.status})`);
    }
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

export async function checkAuthStatus() {
    const res = await fetch("/api/auth/status", {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Not authenticated"); //TODO this error should be named better (does it even need an error?)
    }
    return true;
}

export async function logout() {
    await fetch("/auth/spotify/logout", {
        method: "GET",
        credentials: "include"
    });
}

export async function login() {
    // await fetch("/auth/spotify/login", {
    //     method: "GET",
    //     credentials: "include"
    // });
    window.location.href = "/auth/spotify/login"; //TODO which way is better?
}

