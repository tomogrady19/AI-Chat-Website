import { loadMessages, getMessages, addMessage, clearMessages } from "./state.js";
import { updateChat, enableInput, disableInput, showLoadMessage, hideLoadMessage } from "./ui.js";

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

// 'enter' key now triggers askAI() function
function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) { //if enter is pressed and not shift
        event.preventDefault(); // stop default behavior when Enter is clicked
        askAI(); // sends the message
    }
}

// grow input text box to fit the content
function autoGrow(element) {
    element.style.height = "auto"; // reset height
    element.style.height = element.scrollHeight + "px"; // grow to fit content
}

// take input from "userInput" and apply relevant response
const input = document.getElementById("userInput");
input.addEventListener("keydown", handleKey);
input.addEventListener("input", () => autoGrow(input));

const askButton = document.getElementById("askButton");
askButton.addEventListener("click", askAI);
