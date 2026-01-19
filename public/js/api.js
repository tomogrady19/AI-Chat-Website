console.log("Loaded: api.js");
import {getMessages} from "./state.js";
import {addMessage, appendChunk, updateLastMessage} from "./state.js";
import {clearInput, updateChat, showLoadMessage, disableInput, hideLoadMessage, enableInput} from "./ui/ui.js";

const isDemo = window.location.pathname === "/demo";

const API_BASE_URL =
    window.location.hostname === "127.0.0.1"
    ? "" //"http://localhost:3000"
    : "https://api.spotify-insights.com";

// call API via backend
export async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    addMessage("user", prompt); //add message to messages
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    addMessage("assistant", ""); // start with empty message to stream response to

    try {
        await streamFromAI(appendChunk);
    } catch (err) {
        updateLastMessage(`${err.message}` || "Unexpected error");
    }

    updateChat();
    hideLoadMessage();
    enableInput();
}

export async function fetchProfile() {
    const timeRange = document.getElementById("timeRange").value;
    const demoParam = isDemo ? "&mode=demo" : "";
    const res = await fetch(`${API_BASE_URL}/api/spotify/profile?timeRange=${timeRange}${demoParam}`, {
        method: "GET",
        credentials: "include"
    });

    if (res.status === 401) {
        const err = new Error("Spotify not authenticated");
        err.code = 401;
        throw err;
    }

    if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
    }

    return res.json();
}

export async function streamFromAI(onChunk) {
    const demoParam = isDemo ? "?mode=demo" : "";
    const timeRange = document.getElementById("timeRange")?.value;

    const res = await fetch(`${API_BASE_URL}/api/ai/ask${demoParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversation: getMessages(), timeRange })
    });

    await streamRes(res, onChunk);
}

export async function streamMusicRecommendations(onChunk) {
    const demoParam = isDemo ? "?mode=demo" : "";
    const timeRange = document.getElementById("timeRange").value;
    const conversation = [ { role: "user", content: "Recommend artists and tracks based on my listening history." } ];

    const res = await fetch(`${API_BASE_URL}/api/ai/ask${demoParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversation: conversation, timeRange })
    });

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

export async function checkAuthStatus() { //TODO rename everywhere to user or me
    if (isDemo) return { authenticated: false };
    const res = await fetch(`${API_BASE_URL}/api/spotify/user`, {
        method: "GET",
        credentials: "include"
    });
    return await res.json();
}

export async function logout() {
    if (isDemo) return;
    const res = await fetch(`${API_BASE_URL}/api/spotify/logout`, {
        method: "GET",
        credentials: "include"
    });
    if (!res.ok) { throw new Error("Logout failed"); }
    window.location.href = "/"; // redirect
}

export async function login() {
    if (isDemo) return;
    window.location.href = `${API_BASE_URL}/api/spotify/login`;
}

export async function switchAccount() {
    if (isDemo) return;
    window.location.href = `${API_BASE_URL}/api/spotify/switch`;
}

export async function fetchPlaybackToken() {
    if (isDemo) {
        throw new Error("Playback unavailable in demo mode");
    }
    const res = await fetch(`${API_BASE_URL}/api/spotify/playback-token`, {
        method: "GET",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Could not fetch playback token");
    return res.json();
}

export async function fetchPlayer(deviceId, trackId, accessToken) {
    if (isDemo) {
        throw new Error("Playback unavailable in demo mode");
    }
    return await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json"},
        body: JSON.stringify({uris: [`spotify:track:${trackId}`]})
    });
}

export async function sendEmail(emailContent) {
    const res = await fetch(`${API_BASE_URL}/api/resend/request-access`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailContent })
        });

    if (!res.ok) {
        throw new Error("Request failed");
    }
}