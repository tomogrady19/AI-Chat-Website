console.log("Loaded: main.js");
import { loadMessages } from "./state.js";
import { updateChat, showProfile, initAuth } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { initPlayback } from "./playback.js";

const isDemo = window.location.pathname === "/demo";

loadMessages();
updateChat();
await init();
await setupEventListeners()

async function init() {
    const authState = await initAuth();
    if (!authState) {
        return; // necessary to prevent showProfile from running if user isn't logged in
    }
    try { await showProfile(); } catch { return; }
    await initPlayback();
}

