console.log("Loaded: events.js");
import { togglePlayPause, playPreview } from "./ui/playback.js"
import { playTrack } from "./state/playback.state.js"
import { switchAccount, sendEmail } from "./api/api.js";
import { clearChat, toggleAssistant, showProfile, askAI, recommendMusic, toggleSpotifyAuth, showRequestAccessModal, closeModal } from "./ui/ui.js";

const isDemo = window.location.pathname === "/demo";

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

    // Request Access modal open/close events
    document.getElementById("requestAccessBtn").addEventListener("click", showRequestAccessModal);
    document.getElementById("modalBackdrop").addEventListener("click", closeModal);
    document.getElementById("modalCancelBtn").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {if (e.key === "Escape") { closeModal(); } });
    document.getElementById("accessRequestForm").addEventListener("submit", sendRequestAccessEmail);
}

// play the track  associated this the clicked play button
async function onPlayButtonClick(e) {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;

    if (isDemo) {
        const previewUrl = btn.dataset.previewUrl;
        if (previewUrl) playPreview(previewUrl, btn);
    } else {
        const trackId = btn.dataset.trackId;
        if (trackId) await playTrack(trackId);
    }
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

async function sendRequestAccessEmail(e) {
    e.preventDefault();

    const accessRequestEmail = document.getElementById("accessRequestEmail");
    const accessRequestStatus = document.getElementById("accessRequestStatus");
    const accessRequestSubmitBtn = document.getElementById("modalSubmitBtn");

    accessRequestStatus.textContent = "Sending request...";
    accessRequestSubmitBtn.disabled = true;

    const emailSent = await sendEmail(accessRequestEmail.value);
    if (emailSent){
        accessRequestStatus.textContent = "Thanks! Your request has been sent. You’ll be added shortly.";
    } else {
        accessRequestStatus.textContent = "Something went wrong. Please try again later.";
    }
    accessRequestEmail.value = "";
    accessRequestSubmitBtn.disabled = false;
}
