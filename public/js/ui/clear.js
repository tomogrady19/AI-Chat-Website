import { clearMessages } from "../state.js";
import { updateChat } from "./chat.js";

export function clearChat() {
    clearMessages();
    updateChat();
}

function clearProfile() {
    const profile = document.getElementById("spotify-content");
    if (profile) profile.innerHTML = "";
}

function clearNowPlaying() {
    const nowPlaying = document.getElementById("now-playing");
    if (nowPlaying) nowPlaying.textContent = "";
}

function clearTogglePlay() {
    const togglePlay = document.getElementById("toggle-play");
    if (togglePlay) togglePlay.hidden = true;
}

function clearTimeRange() {
    const timeRangeLabel = document.querySelector('label[for="timeRange"]');
    const timeRangeSelect = document.getElementById("timeRange");

    timeRangeLabel.hidden = true;
    timeRangeSelect.hidden = true;
}

export function clearUI() {
    clearProfile();
    clearNowPlaying();
    clearTimeRange();
    clearTogglePlay();
    clearChat();
}