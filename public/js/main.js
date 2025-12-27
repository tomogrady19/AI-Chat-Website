import { loadMessages, addMessage, clearMessages, appendChunk, updateLastMessage } from "./state.js";
import {
    updateChat,
    enableInput,
    disableInput,
    showLoadMessage,
    hideLoadMessage,
    clearInput,
    renderTopArtists,
    renderTopTracks,
    renderRecent,
    showLoggedIn,
    showLoggedOut
} from "./ui.js";
import { setupEventListeners } from "./events.js"
import {
    streamFromAI,
    streamMusicRecommendations,
    fetchProfile,
    checkAuthStatus,
    login,
    logout,
    switchAccount
} from "./api.js"

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat, onToggleAssistant: toggleAssistant, onProfile: showProfile, onRecommend: recommendMusic, onSpotifyAuth: toggleSpotifyAuth, onSpotifySwitch: switchAccount});

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

async function showProfile() {
    try {
        const data = await fetchProfile();
        renderTopArtists(data.artists);
        renderTopTracks(data.tracks);
        renderRecent(data.recent);
    } catch (err) {
        console.error(err)
        alert("Spotify not connected")
    }
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
        showLoggedOut();
    } else {
        await login();
        showLoggedIn();
    }
}

async function initAuth() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
          showLoggedIn();
        } else {
          showLoggedOut();
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        showLoggedOut();
    }
}

await initAuth();
