console.log("Loaded: main.js");
import { loadMessages } from "./state.js";
import { updateChat, showProfile, initAuth } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { initPlayback } from "./playback.js";

const isDemo = window.location.pathname === "/demo";

loadMessages();
updateChat();
if (!isDemo){
    await init();
} else {
    initDemo();
}
await setupEventListeners()

async function init() {
    const authState = await initAuth();
    if (!authState) {
        return; // necessary to prevent showProfile from running if user isn't logged in
    }
    try { await showProfile(); } catch { return; }
    await initPlayback();
}

async function initDemo() {
    //rewire demo button to home button
    const demoLink = document.querySelector('#spotify-auth a');
    const demoButton = demoLink?.querySelector("button");
    if (demoLink && demoButton) {
        demoLink.href = "/";
        demoButton.textContent = "Back to Live";
    }

    //hide spotifyAuthBtn and spotifySwitchBtn
    const spotifyAuthBtn = document.getElementById("spotifyAuthBtn");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    const timeRange = document.getElementById("timeRange");
    if (spotifyAuthBtn) spotifyAuthBtn.style.display = "none";
    if (spotifySwitchBtn) spotifySwitchBtn.style.display = "none";
    if (timeRange) timeRange.style.display = "none";

    //change subtitle message for demo mode
    const subtitleMessage = document.getElementById("subtitle");
    subtitleMessage.textContent = "Welcome to demo mode!";

    try { await showProfile(); } catch { return; }
}
