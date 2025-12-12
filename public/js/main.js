import { loadMessages, addMessage, clearMessages } from "./state.js";
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
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    try {
        const aiReply = await sendMessageToAI();
        addMessage("assistant", aiReply);
    } catch {
        addMessage("assistant", "Something went wrong. Please try again.");
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
