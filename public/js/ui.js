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
    const container = document.getElementById("artists-section");

    // const existing = document.getElementById("spotify-results");
    // if (existing) existing.remove();
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Top Artists";

    const list = document.createElement("ul");

    artists.forEach(artist => {
        const li = document.createElement("li");
        li.className = "artist-item";

        const img = document.createElement("img");
        img.src = artist.images?.[0]?.url || "";
        img.alt = artist.name;

        const name = document.createElement("span");
        name.textContent = artist.name;

        li.appendChild(img);
        li.appendChild(name);
        list.appendChild(li);
    });


    container.appendChild(title);
    container.appendChild(list);
}

export function renderTopTracks(tracks) {
    const container = document.getElementById("tracks-section");

    // Remove previous track results if they exist
    // const existing = document.getElementById("spotify-tracks");
    // if (existing) existing.remove();
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Top Tracks";

    const list = document.createElement("ol");

    tracks.forEach(track => {
        const li = document.createElement("li");
        li.className = "track-item";

        const img = document.createElement("img");
        img.src = track.album.images?.[0]?.url || "";
        img.alt = track.name;

        const text = document.createElement("span");
        text.textContent = `${track.name} — ${track.artists.map(a => a.name).join(", ")}`;

        li.appendChild(img);
        li.appendChild(text);
        list.appendChild(li);
    });


    container.appendChild(title);
    container.appendChild(list);
}
