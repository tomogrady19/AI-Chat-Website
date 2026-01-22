import { fetchUser } from "../api/api.js";
import { showNotPremium } from "./ui.js";
import { initPlayback, playTrackById, togglePlayback } from "../state/playback.state.js";

const isDemo = window.location.pathname === "/demo";

let previewAudio = null;
let isPaused = true;

export async function playTrack(trackId) {
    const user = await fetchUser();
    if (!user) return;

    if (user.product !== "premium") {
        showNotPremium();
        return;
    }

    const success = await playTrackById(trackId);
    if (!success) {
        alert("Playback Not Available");
        return;
    }

    document.getElementById("toggle-play").textContent = "⏸";
    isPaused = false;
}

export async function togglePlayPause() {
    const button = document.getElementById("toggle-play");

    const success = isDemo
        ? toggleDemoPlayback()
        : await toggleLivePlayback();

    if (!success) return;

    isPaused = !isPaused;
    button.textContent = isPaused ? "▶" : "⏸";
}

function toggleDemoPlayback() {
    if (!previewAudio) return false;

    if (isPaused) previewAudio.play();
    else previewAudio.pause();

    return true;
}

async function toggleLivePlayback() {
    const user = await fetchUser();
    if (!user) return false;

    if (user.product !== "premium") {
        showNotPremium();
        return false;
    }

    return await togglePlayback();
}

export function playPreview(previewUrl) {
    if (!previewUrl) {
        alert("No preview available for this track");
        return;
    }

    if (previewAudio) previewAudio.pause();

    previewAudio = new Audio(previewUrl);
    previewAudio.volume = 0.8;
    previewAudio.play();

    document.getElementById("toggle-play").textContent = "⏸";
    isPaused = false;
}
