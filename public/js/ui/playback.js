import { fetchUser } from "../api/api.js";
import { showNotPremium } from "./ui.js";
import { initPlayback, playTrackById, togglePlayback } from "../state/playback.state.js";

const isDemo = window.location.pathname === "/demo";

let previewAudio = null;
let isPaused = true;
let user;
let pending;

export async function playTrack(trackId) {
    user = await fetchUserCached();
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
    updateNowPlaying();

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
    user = await fetchUserCached();
    if (!user) return false;

    if (user.product !== "premium") {
        showNotPremium();
        return false;
    }

    return await togglePlayback();
}

export function playPreview(previewUrl, btn) {
    if (!previewUrl) {
        alert("No preview available for this track");
        return;
    }

    if (previewAudio) {
        previewAudio.pause();
    }

    previewAudio = new Audio(previewUrl);
    previewAudio.volume = 0.8;
    updateNowPlaying(btn);

    previewAudio.onended = () => {
        isPaused = true;
        document.getElementById("toggle-play").textContent = "▶";
    };
    previewAudio.play();

    document.getElementById("toggle-play").textContent = "⏸";
    isPaused = false;
}

async function fetchUserCached() {
    if (user) return user;
    if (!pending) {
        pending = fetchUser()
            .then(u => (user = u))
            .finally(() => (pending = null));
    }
    return pending;
}

function updateNowPlaying(btn=null) {
    const el = document.getElementById("now-playing");
    if (!el) return;

    if (isDemo) {
        el.textContent = `${btn.dataset.name} — ${btn.dataset.artists}`;
    } else {
        if (!currentTrack) {
            el.textContent = "";
            return;
        }

        el.textContent = `${currentTrack.name} — ${currentTrack.artists}`;
    }
}