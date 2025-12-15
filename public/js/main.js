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
import { sendMessageToAI } from "./api.js"

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat});

// call API via backend
async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    try {
        addMessage("user", prompt); //add message to messages
        clearInput(); // clear input box once the message is added to chat

        updateChat();
        showLoadMessage();
        disableInput(); // disable user input while response is being fetched by API

        addMessage("assistant", ""); // start with empty message to stream response to
        await sendMessageToAI(appendChunk);
    } catch {
        showErrorMessage()
    }

    updateChat();
    hideLoadMessage();
    enableInput();
    showErrorMessage()
}

// clear the chat
function clearChat() {
    clearMessages();
    updateChat();
}