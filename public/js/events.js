import { togglePlayPause } from "./playback.js"
import { askAI, switchAccount } from "./api.js";
import { clearChat, toggleAssistant, showProfile, recommendMusic, toggleSpotifyAuth, playTrack} from "./ui.js";

//TODO finish refactoring this (and ui.js)
export async function setupEventListeners() {
    document.getElementById("askButton")?.addEventListener("click", askAI);
    document.getElementById("clearButton")?.addEventListener("click", clearChat);
    document.getElementById("assistant-toggle")?.addEventListener("click", toggleAssistant);
    document.getElementById("spotifyAuthBtn")?.addEventListener("click", toggleSpotifyAuth);
    document.getElementById("spotifySwitchBtn")?.addEventListener("click", switchAccount);
    document.getElementById("recommendButton")?.addEventListener("click", recommendMusic);
    document.getElementById("timeRange")?.addEventListener("change", showProfile);

    const input = document.getElementById("userInput");
    // Enter / Shift+Enter handling
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            askAI();
        }
    });
    // Auto-grow textarea as input grows
    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
    });

    //TODO comment this more
    document.getElementById("spotify-content").addEventListener("click", (e) => {
        const btn = e.target.closest(".play-btn");
        if (!btn) return;
        const trackId = btn.dataset.trackId;
        if (trackId) playTrack(trackId);
    });

    document.getElementById("toggle-play").addEventListener("click", async () => {
        try {
            await togglePlayPause();
        } catch (e) {
            alert(e.message || "Playback unavailable (Premium required)");
        }
});
}
