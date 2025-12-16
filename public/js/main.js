import { loadMessages, addMessage, clearMessages, appendChunk } from "./state.js";
import {
    updateChat,
    enableInput,
    disableInput,
    showLoadMessage,
    hideLoadMessage,
    clearInput,
    showErrorMessage
} from "./ui.js";
import { setupEventListeners } from "./events.js"
import { streamFromAI } from "./api.js"

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat, onToggle: toggleDrawer});

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