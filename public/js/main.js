import { loadMessages, addMessage, clearMessages, updateLastMessage } from "./state.js";
import { updateChat, enableInput, disableInput, showLoadMessage, hideLoadMessage, clearInput } from "./ui.js";
import { setupEventListeners } from "./events.js"
import { sendMessageToAI } from "./api.js"

loadMessages();
updateChat();
setupEventListeners({ onAsk: askAI, onClear: clearChat});

// call API via backend
async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    addMessage("user", prompt); //add message to messages
    addMessage("assistant", "");
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    let aiReply = "";

    try {
        await sendMessageToAI((chunk) => {
            aiReply += chunk;
            updateLastMessage(aiReply);
            updateChat();
        });
    } catch {
        updateLastMessage("Something went wrong. Please try again.");
    }

    updateChat();
    hideLoadMessage();
    enableInput();
}

// clear the chat
function clearChat() {
    console.log("testing clear chat button");
    clearMessages();
    updateChat();
}
