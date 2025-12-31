console.log("Loaded: state.js");
import { updateChat } from "./ui/ui.js";

let messages = [];

export function loadMessages() {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
        messages = JSON.parse(saved);
    }
    return messages;
}

export function getMessages() {
    return messages;
}

function saveMessages() {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

export function addMessage(role, content) {
    messages.push({ role, content });
    saveMessages();
}

export function clearMessages() {
    messages = [];
    localStorage.removeItem("chatHistory"); // clear local memory
}

//TODO these two functions use updateChat, could need refactoring in future
export function appendChunk(chunk){
    if (messages.length === 0) return;

    messages[messages.length - 1].content += chunk;
    saveMessages();
    updateChat();
}

export function updateLastMessage(content) {
    messages[messages.length - 1].content = content;
    saveMessages();
    updateChat();
}