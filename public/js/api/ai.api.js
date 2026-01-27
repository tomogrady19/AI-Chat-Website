import { API_BASE_URL, isDemo } from "./config.js";

export async function streamFromAI(conversation, timeRange, onChunk) {
    const demoParam = isDemo ? "?mode=demo" : "";
    const res = await fetch(`${API_BASE_URL}/api/ai/ask${demoParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversation, timeRange })
    });
    if (!res.ok){
        const data = await res.json();
        console.error("AI Request failed", res.status, data?.error);
        alert("AI Not Available");
        return false;
    }
    await streamRes(res, onChunk);
    return true;
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