import { getMessages, addMessage, updateLastMessage, appendChunk } from "../state.js";
import {streamMusicRecommendations} from "../api.js"

export function toggleAssistant() {
    const drawer = document.getElementById("assistant-drawer");
    const shouldOpen = !drawer.classList.contains("open");

    drawer.classList.toggle("open", shouldOpen);
    drawer.setAttribute("aria-hidden", String(!shouldOpen));
}

export async function recommendMusic() {
    addMessage("assistant", "");
    updateChat();

    try {
        await streamMusicRecommendations(appendChunk);
    } catch (err) {
        updateLastMessage(err.message || "Failed to load music recommendations");
    }

    updateChat();
}

export function updateChat() {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    getMessages().forEach(msg => {
        const who = msg.role;
        const message = who === "assistant" ? window.marked.parse(msg.content) : msg.content;
        chat.innerHTML += `<div class="message ${who}">${message}</div>`;
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