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
    renderRecent
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

    let receivedAnyData = false;

    // TODO move this as a function elsewhere (there may already be an onChunk function). Maybe move inside streamFromAI function
    const onChunk = (chunk) => {
        receivedAnyData = true;
        appendChunk(chunk);
    };

    // Timeout in case streaming never starts
    const timeoutId = setTimeout(() => {
        if (!receivedAnyData) {
            showError("AI failed to respond");
        }
    }, 3000);

    try {
        await streamFromAI(onChunk);
    } catch (err) {
        updateLastMessage(`${err.message}` || "Unexpected error");
    } finally {
        clearTimeout(timeoutId);
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
        await streamMusicRecommendations(appendChunk); //TODO put the try await clause inside the function?
    } catch (err) {
        updateLastMessage(err.message || "Failed to load music recommendations");
    }

    updateChat();
}
