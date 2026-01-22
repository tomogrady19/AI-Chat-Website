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

    if (isDemo) { //TODO toggle play/pause logic for demo mode should mirror live mode
        if (!previewAudio) return;

        if (isPaused) {
            previewAudio.play();
            button.textContent = "⏸";
        } else {
            previewAudio.pause();
            button.textContent = "▶";
        }

        isPaused = !isPaused;
        return;
    }

    const user = await fetchUser();
    if (!user) return;

    if (user.product !== "premium") {
        showNotPremium();
        return;
    }

    const success = await togglePlayback();
    if (!success) return;

    isPaused = !isPaused;
    button.textContent = isPaused ? "▶" : "⏸";
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
