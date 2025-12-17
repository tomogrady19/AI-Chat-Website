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

export function showErrorMessage() {
    document.getElementById("status").innerText = "Something went wrong. Please try again.";
}

export function renderTopArtists(artists) {
    const app = document.getElementById("app");

    const existing = document.getElementById("spotify-results");
    if (existing) existing.remove();

    const container = document.createElement("section");
    container.id = "spotify-results";
    container.className = "spotify-block";

    const title = document.createElement("h2");
    title.textContent = "Your Top Artists";

    const list = document.createElement("ul");

    artists.forEach(artist => {
        const li = document.createElement("li");
        li.textContent = artist.name;
        list.appendChild(li);
    });

    container.appendChild(title);
    container.appendChild(list);
    app.appendChild(container);
}
