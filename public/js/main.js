import { loadMessages, addMessage, clearMessages, appendChunk, updateLastMessage } from "./state.js";
import {
    updateChat,
    enableInput,
    disableInput,
    showLoadMessage,
    hideLoadMessage,
    clearInput,
    showLoggedIn,
    showLoggedOut,
    showProfile,
    clearProfile
} from "./ui.js";
import { setupEventListeners } from "./events.js"
import {
    streamFromAI,
    streamMusicRecommendations,
    checkAuthStatus,
    login,
    logout,
    switchAccount
} from "./api.js"
import { initPlayback, playTrackById } from "./playback.js";

loadMessages();
updateChat();
await showProfile();
await initAuth();
setupEventListeners({ onAsk: askAI, onClear: clearChat, onToggleAssistant: toggleAssistant, onProfile: showProfile, onRecommend: recommendMusic, onSpotifyAuth: toggleSpotifyAuth, onSpotifySwitch: switchAccount, onPlayTrack: playTrack});

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
    } catch (err) {
        updateLastMessage(`${err.message}` || "Unexpected error");
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

function toggleAssistant() {
    const drawer = document.getElementById("assistant-drawer");
    const shouldOpen = !drawer.classList.contains("open");

    drawer.classList.toggle("open", shouldOpen);
    drawer.setAttribute("aria-hidden", String(!shouldOpen));
}

async function recommendMusic() {
    addMessage("assistant", "");
    updateChat();

    try {
        await streamMusicRecommendations(appendChunk);
    } catch (err) {
        updateLastMessage(err.message || "Failed to load music recommendations");
    }

    updateChat();
}

async function toggleSpotifyAuth() {
    const spotifyAuthButton = document.getElementById("spotifyAuthBtn");
    if (spotifyAuthButton.textContent.includes("Log out")) { //TODO consider if this is best way
        await logout();
        clearProfile();
        showLoggedOut();
    } else {
        await login();
        await showProfile()
        showLoggedIn();
    }
}

async function initAuth() {
    try {
        const isLoggedIn = await checkAuthStatus(); // TODO not sure if this works (check for cookies instead)
        if (isLoggedIn) {
            showLoggedIn();
            initPlayback().catch(err => console.warn("Playback init failed:", err));
        } else {
            showLoggedOut();
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        showLoggedOut();
    }
}

async function playTrack(trackId) {
    try {
        await playTrackById(trackId);
    } catch (err) {
        console.error(err);
        alert(err.message || "Playback failed (Premium required for in-app playback).");
    }
}
