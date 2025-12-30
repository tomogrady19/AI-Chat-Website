console.log("Loaded: main.js");
import { loadMessages } from "./state.js";
import { initAuth, updateChat, showProfile } from "./ui/ui.js";
import { setupEventListeners } from "./events.js"
import { initPlayback } from "./playback.js";

loadMessages();
updateChat();
await init();
await setupEventListeners()

async function init() {
    await initAuth();
    await showProfile();
    await initPlayback();
}
