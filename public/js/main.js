console.log("Loaded: main.js");
import { loadMessages } from "./state.js";
import { updateChat, showProfile, showFailedCallback, showLoggedIn, showLoggedOut } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { initPlayback } from "./playback.js";
import { getUser } from "./api.js";

const isDemo = window.location.pathname === "/demo";
const callbackFailed = checkFailedCallback();

if (callbackFailed){
    showFailedCallback();
} else if (!isDemo){
    await init();
} else{
    initDemo();
}
await setupEventListeners()
loadMessages();
updateChat();

async function init() {
    try {
        const user = await getUser();
        if (user) {
            showLoggedIn();
            await showProfile();
            if (user.premium) {
                await initPlayback();
            }
        } else {
            showLoggedOut();
        }
        return user;
    } catch (err) {
        console.error("init failed:", err);
        showLoggedOut();
        return false;
    }
}

async function initDemo() {
    //rewire demo button to home button
    const demoLink = document.querySelector('a[href="/demo"]');
    const demoButton = demoLink?.querySelector("button");
    if (demoLink && demoButton) {
        demoLink.href = "/";
        demoButton.textContent = "Back to Live";
    }

    //hide spotifyAuthBtn and spotifySwitchBtn
    const requestAccessBtn = document.getElementById("requestAccessBtn");
    const spotifyAuthBtn = document.getElementById("spotifyAuthBtn");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    const timeRange = document.querySelector(".control-box");
    if (requestAccessBtn) requestAccessBtn.classList.add("is-hidden");
    if (spotifyAuthBtn) spotifyAuthBtn.classList.add("is-hidden");
    if (spotifySwitchBtn) spotifySwitchBtn.classList.add("is-hidden");
    if (timeRange) timeRange.classList.add("is-hidden");

    //change subtitle message for demo mode
    const subtitleMessage = document.getElementById("subtitle");
    subtitleMessage.textContent = "Welcome to demo mode!\nShown below is sample listening data to demonstrate how the app works.\nTry playing track previews or chatting with the AI assistant."
    try { await showProfile(); } catch { return; }
}

function checkFailedCallback() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("callback") === "failed") {
        window.history.replaceState({}, "", "/"); // Clean the URL
        return true;
    }
    return false;
}