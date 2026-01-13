console.log("Loaded: events.js");
import { togglePlayPause, playTrack, playPreview } from "./playback.js"
import { askAI, switchAccount, sendEmail } from "./api.js";
import { clearChat, toggleAssistant, showProfile, recommendMusic, toggleSpotifyAuth } from "./ui/ui.js";

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
    document.getElementById("requestAccessBtn").addEventListener("click", openModal);
    document.getElementById("requestAccessBackdrop").addEventListener("click", closeModal);
    document.getElementById("modalCancelBtn").addEventListener("click", closeModal);
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

// close modal overlay
function closeModal() {
    document.getElementById("demoBtn").focus();
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");
    modal.setAttribute("inert", "");
    modal.setAttribute("aria-hidden", "true");
}

// open modal overlay
export function openModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    modal.removeAttribute("inert");
    modal.removeAttribute("aria-hidden");
    document.getElementById("modalCancelBtn").focus();
}

async function sendRequestAccessEmail(e) {
    e.preventDefault();

    const accessRequestEmail = document.getElementById("accessRequestEmail");
    const accessRequestStatus = document.getElementById("accessRequestStatus");
    const accessRequestSubmitBtn = document.getElementById("modalSubmitBtn");

    accessRequestStatus.textContent = "Sending request...";
    accessRequestSubmitBtn.disabled = true;

    try {
        await sendEmail(accessRequestEmail.value);
        accessRequestStatus.textContent = "Thanks! Your request has been sent. You’ll be added shortly.";
        accessRequestEmail.value = "";
    } catch (err) {
        accessRequestStatus.textContent = "Something went wrong. Please try again later.";
    } finally {
        accessRequestSubmitBtn.disabled = false;
    }
}
