import { getMessages } from "./state.js";

export function updateChat() {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    getMessages().forEach(msg => {
        const who = msg.role;
        chat.innerHTML += `<div class="message ${who}">${msg.content}</div>`;
    });

    chat.scrollTop = chat.scrollHeight;
}

export function showLoadMessage() {
    document.getElementById("typing").innerText = "AI is typing...";
}

export function hideLoadMessage() {
    document.getElementById("typing").innerText = "";
}

export function disableInput() {
    document.getElementById("userInput").disabled = true;
    document.querySelector("button[onclick='askAI()']").disabled = true;
}

export function enableInput() {
    document.getElementById("userInput").disabled = false;
    document.querySelector("button[onclick='askAI()']").disabled = false;
    document.getElementById("userInput").focus(); // returns cursor to the box
}
