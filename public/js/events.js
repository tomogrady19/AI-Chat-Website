import { togglePlayPause, playTrack } from "./playback.js"
import { askAI, switchAccount } from "./api.js";
import { clearChat, toggleAssistant, showProfile, recommendMusic, toggleSpotifyAuth } from "./ui/ui.js";

export async function setupEventListeners() {
    // Spotify auth/login events
    document.getElementById("spotifyAuthBtn")?.addEventListener("click", toggleSpotifyAuth);
    document.getElementById("spotifySwitchBtn")?.addEventListener("click", switchAccount);

    // central spotify content events
    document.getElementById("timeRange")?.addEventListener("change", showProfile);
    document.getElementById("toggle-play").addEventListener("click", togglePlayPause);
    document.getElementById("spotify-content").addEventListener("click", onPlayButtonClick);

    // AI assistant events
    document.getElementById("recommendButton")?.addEventListener("click", recommendMusic);
    document.getElementById("askButton")?.addEventListener("click", askAI);
    document.getElementById("clearButton")?.addEventListener("click", clearChat);
    document.getElementById("assistant-toggle")?.addEventListener("click", toggleAssistant);
    const input = document.getElementById("userInput");
    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("input", growTextArea);
}

// play the track  associated this the clicked play button
async function onPlayButtonClick(e) {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;

    const trackId = btn.dataset.trackId;
    if (trackId) await playTrack(trackId);
}

// Enter / Shift+Enter handling
async function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await askAI();
    }
}

// Auto-grow textarea as input grows
function growTextArea(e) {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
}
