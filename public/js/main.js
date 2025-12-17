import { loadMessages, addMessage, clearMessages, appendChunk } from "./state.js";
import {
    updateChat,
    enableInput,
    disableInput,
    showLoadMessage,
    hideLoadMessage,
    clearInput,
    showErrorMessage,
    renderTopArtists,
    renderTopTracks,
} from "./ui.js";
import { setupEventListeners } from "./events.js"
import {
    streamFromAI,
    streamMusicRecommendations,
    fetchProfile
} from "./api.js"
//TODO (import * as UI from "./ui.js) UI.updateChat())

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat, onToggle: toggleDrawer, onProfile: showProfile, onRecommend: recommendMusic});

// call API via backend
async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    addMessage("user", prompt); //add message to messages
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    addMessage("assistant", ""); // start with empty message to stream response to

    try {
        await streamFromAI(appendChunk);
    } catch {
        showErrorMessage()
    }

    updateChat();
    hideLoadMessage();
    enableInput();
}

// clear the chat
function clearChat() {
    clearMessages();
    updateChat();
}

function toggleDrawer() {
    const drawer = document.getElementById("assistant-drawer");
    const shouldOpen = !drawer.classList.contains("open");

    drawer.classList.toggle("open", shouldOpen);
    drawer.setAttribute("aria-hidden", String(!shouldOpen));
}

async function showProfile() {
    try {
        const data = await fetchProfile();
        renderTopArtists(data.artists);
        renderTopTracks(data.tracks);
    } catch (err) {
        console.error(err)
        alert("Spotify not connected")
    }
}

async function recommendMusic() {
    addMessage("assistant", "");
    updateChat();

    try {
        await streamMusicRecommendations(appendChunk); //TODO put the try await clause inside the function?
    } catch {
        showErrorMessage();
    }

    updateChat();
}
