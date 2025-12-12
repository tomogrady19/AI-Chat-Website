import { loadMessages, getMessages, addMessage, clearMessages } from "./state.js";
import { updateChat, enableInput, disableInput, showLoadMessage, hideLoadMessage } from "./ui.js";
import { setupEventListeners } from "./events.js"
import { sendMessageToAI } from "./api.js"

loadMessages()
updateChat()

// call API via backend
async function askAI() {
    const prompt = document.getElementById("userInput").value.trim(); // set prompt to the user input
    if (!prompt) return;

    addMessage("user", prompt) //add message to messages
    updateChat();
    document.getElementById("userInput").value = ""; // clear input box once the message is added to chat
    showLoadMessage()

    // disable user input while response is being fetched by API
    disableInput()

    try {
        const aiReply = await sendMessageToAI();
        addMessage("ai_assistant", aiReply);
    } catch (err) {
        console.error(err);
        addMessage("ai_assistant", "Something went wrong. Please try again.");
    }

    updateChat()
    hideLoadMessage()
    enableInput()

}

// clear the chat (also self-explanatory)
function clearChat() {
    clearMessages()
    updateChat()
}

setupEventListeners({onAsk: askAI} );
