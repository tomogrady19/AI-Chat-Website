import { clearMessages } from "../state/chat.state.js";
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
    document.querySelector(".spotify-controls").classList.add("is-hidden"); //hide everything in spotify-controls class
    document.getElementById("assistant-toggle").classList.add("is-hidden"); //hide the AI assistant button
}

export function clearUI() {
    clearProfile();
    clearMainButtons();
    clearChat();
}