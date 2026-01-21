console.log("Loaded: main.js");
import { loadMessages } from "./state.js";
import { updateChat, showProfile, showFailedCallback, showLoggedIn, showLoggedOut } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { initPlayback } from "./playback.js";
import { fetchUser } from "./api.js";

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
    const user = await fetchUser();
    if (user) {
        showLoggedIn();
        await showProfile();
        if (user.product === "premium") {
            await initPlayback();
        }
    } else {
        showLoggedOut();
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

    // hide auth section and time range section
    document.getElementById("spotify-auth")?.classList.add("is-hidden");
    document.querySelector(".control-box").classList.add("is-hidden");

    //change subtitle message for demo mode
    const subtitleMessage = document.getElementById("subtitle");
    subtitleMessage.textContent = "Welcome to demo mode!\nShown below is sample listening data to demonstrate how the app works.\nTry playing track previews or chatting with the AI assistant."
    await showProfile();
}

function checkFailedCallback() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("callback") === "failed") {
        window.history.replaceState({}, "", "/"); // Clean the URL
        return true;
    }
    return false;
}