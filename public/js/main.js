import { loadMessages, getMessages, addMessage, clearMessages } from "./state.js";
import { updateChat, enableInput, disableInput, showLoadMessage, hideLoadMessage } from "./ui.js";
import { setupEventListeners } from "./events.js"

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

    // process request via backend
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: getMessages() })
    });

    const data = await res.json(); //extract data from json response
    addMessage("ai_assistant", data.output) // push response to the end of messages
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
