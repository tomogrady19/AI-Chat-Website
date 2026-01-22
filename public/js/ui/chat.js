import { getMessages, addMessage, appendChunk } from "../state/chat.state.js";
import { streamFromAI } from "../api/api.js"

export function toggleAssistant() {
    const drawer = document.getElementById("assistant-drawer");
    const shouldOpen = !drawer.classList.contains("open");

    drawer.classList.toggle("open", shouldOpen);
    drawer.setAttribute("aria-hidden", String(!shouldOpen));
    if (shouldOpen) {
        document.getElementById("assistant-toggle").textContent = "✕ Close";
    } else {
        document.getElementById("assistant-toggle").textContent = "AI Assistant";
    }
}

export async function askAI() {
    const prompt = document.getElementById("userInput").value.trim();
    if (!prompt) return;

    addMessage("user", prompt); //add message to messages
    clearInput(); // clear input box once the message is added to chat

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    addMessage("assistant", ""); // start with empty message to stream response to

    const conversation = getMessages();
    const timeRange = document.getElementById("timeRange")?.value;
    const success = await streamFromAI(conversation, timeRange, streamChunk);

    updateChat();
    hideLoadMessage();
    enableInput();

    if (!success) alert("AI Not Available");
}

export async function recommendMusic() {
    addMessage("user", "Recommend artists and tracks based on my listening history.");

    updateChat();
    showLoadMessage();
    disableInput(); // disable user input while response is being fetched by API

    addMessage("assistant", ""); // start with empty message to stream response to

    const conversation = getMessages();
    const timeRange = document.getElementById("timeRange")?.value;
    const success = await streamFromAI(conversation, timeRange, streamChunk);

    updateChat();
    hideLoadMessage();
    enableInput();

    if (!success) alert("AI Not Available");
}

export function updateChat() {
    const chat = document.querySelector(".assistant-chat");;
    chat.innerHTML = "";

    getMessages().forEach(msg => {
        const who = msg.role;
//        below lines removed to prevent injection vulnerability (sacrificing formatting for now)
//        const message = who === "assistant" ? window.marked.parse(msg.content) : msg.content;
//        chat.innerHTML += `<div class="message ${who}">${message}</div>`;
        const messageEl = document.createElement("div");
        messageEl.className = `message ${who}`;
        messageEl.textContent = msg.content;
        chat.appendChild(messageEl);

    });

    chat.scrollTop = chat.scrollHeight;
}

export function showLoadMessage() {
    document.getElementById("status").innerText = "AI is typing...";
}

export function hideLoadMessage() {
    document.getElementById("status").innerText = "";
}

export function disableInput() {
    document.getElementById("userInput").disabled = true;
    document.getElementById("askButton").disabled = true;
}

export function enableInput() {
    document.getElementById("userInput").disabled = false;
    document.getElementById("askButton").disabled = false;
    document.getElementById("userInput").focus(); // returns cursor to the box
}

export function clearInput(){
    document.getElementById("userInput").value = "";
}

function streamChunk(chunk) {
  appendChunk(chunk);
  updateChat();
}