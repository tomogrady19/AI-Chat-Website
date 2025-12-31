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

function clearMainButtons() {
    document.getElementById("now-playing").textContent = ""; //clear current song name
    document.getElementById("mainButtons").style.display = "none"; //hide everything in mainButtons class
}

export function clearUI() {
    clearProfile();
    clearMainButtons();
    clearChat();
}