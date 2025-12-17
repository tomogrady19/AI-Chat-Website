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
import { streamFromAI, fetchTopArtists, fetchTopTracks } from "./api.js"
//TODO import all from UI instead of naming every one

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat, onToggle: toggleDrawer, onArtists: showTopArtists, onTracks: showTopTracks});

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

async function showTopArtists() {
    try {
        const data = await fetchTopArtists();
        renderTopArtists(data.items);
    } catch (err) {
        console.error(err);
        alert("Please connect Spotify first");
    }
}

async function showTopTracks() {
    try {
        const data = await fetchTopTracks();
        renderTopTracks(data.items);
    } catch (err) {
        console.error(err);
        alert("Please connect Spotify first");
    }
}
