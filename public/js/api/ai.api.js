import {getMessages} from "../state.js";
import {addMessage, appendChunk, updateLastMessage} from "../state.js";
import {clearInput, updateChat, showLoadMessage, disableInput, hideLoadMessage, enableInput} from "../ui/ui.js";

const isDemo = window.location.pathname === "/demo";

const API_BASE_URL =
    window.location.hostname === "127.0.0.1"
    ? "" //"http://localhost:3000"
    : "https://api.spotify-insights.com";

export async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    addMessage("user", prompt); //add message to messages
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    addMessage("assistant", ""); // start with empty message to stream response to

    await streamFromAI(appendChunk);

    updateChat();
    hideLoadMessage();
    enableInput();
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
    if (!res.ok){
        const data = await res.json();
        console.error("AI Request failed", res.status, data?.error);
        alert("AI Not Available");
        return;
    }
    await streamRes(res, onChunk);
}

async function streamRes(res, onChunk) {
    if (!res.ok || !res.body) {
        try {
            const data = await res.json();
            console.error(data?.error);
        } catch {
            console.error("Request failed", res.status);
        }
        alert("Request failed");
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
    }
}