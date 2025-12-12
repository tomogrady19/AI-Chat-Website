import { loadMessages, getMessages, addMessage, clearMessages } from "./state.js";

loadMessages()
updateChat()

// call API via backend
async function askAI() {
    const prompt = document.getElementById("userInput").value.trim(); // set prompt to the user input
    if (!prompt) return;

    addMessage("user", prompt) //add message to messages
    updateChat();
    document.getElementById("userInput").value = ""; // clear input box once the message is added to chat
    document.getElementById("typing").innerText = "AI is typing..."; // add loading message

    // disable user input while response is being fetched by API
    document.getElementById("userInput").disabled = true;
    document.querySelector("button[onclick='askAI()']").disabled = true;


    // process request via backend
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: getMessages() })
    });

    const data = await res.json(); //extract data from json response
    addMessage("ai_assistant", data.output) // push response to the end of messages
    updateChat()
    document.getElementById("typing").innerText = ""; // remove loading message

    // enable user input once response has been fetched
    document.getElementById("userInput").disabled = false;
    document.querySelector("button[onclick='askAI()']").disabled = false;
    document.getElementById("userInput").focus();  // optional: returns cursor to the box

}

// update the chat (self-explanatory)
function updateChat() {
    const chat = document.getElementById("chat"); //get chat from webpage
    chat.innerHTML = ""; //clear chat content

    // repopulate entire chat from scratch
    getMessages().forEach(msg => {
        const who = msg.role;
        chat.innerHTML += `<div class="message ${who}">${msg.content}</div>`;
    });
    chat.scrollTop = chat.scrollHeight; // scroll to bottom of chat
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