import { loadMessages } from "./state.js";
import { updateChat, showLoggedIn, showLoggedOut, showProfile } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { checkAuthStatus } from "./api.js"
import { initPlayback } from "./playback.js";

loadMessages();
updateChat();
await initAuth();
await setupEventListeners()

async function initAuth() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
            showLoggedIn();
            await showProfile();
            initPlayback().catch(err => console.warn("Playback init failed:", err));
        } else {
            showLoggedOut();
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        showLoggedOut();
    }
}
