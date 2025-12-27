import { getMessages } from "./state.js";

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

export function renderTopArtists(artists) {
    const container = document.getElementById("artists-section");
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

export function renderRecent(recent) {
    const container = document.getElementById("recent-section");
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Recent Tracks";

    const list = document.createElement("ol");

    recent.forEach(recentItem => {
        const li = document.createElement("li");
        li.className = "recent-item";

        const img = document.createElement("img");
        img.src = recentItem.track.album.images?.[0]?.url || "";
        img.alt = recentItem.track.name;

        const text = document.createElement("span");
        text.textContent = `${recentItem.track.name} — ${recentItem.track.artists.map(a => a.name).join(", ")}`;

        li.appendChild(img);
        li.appendChild(text);
        list.appendChild(li);
    });


    container.appendChild(title);
    container.appendChild(list);
}

export function showLoggedIn() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const profileBtn = document.getElementById("spotify-profile");
      authBtn.textContent = "Log out of Spotify";
      profileBtn.style.display = "inline-block"; // display profile button
}

export function showLoggedOut() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const profileBtn = document.getElementById("spotify-profile");
      authBtn.textContent = "Log in with Spotify";
      profileBtn.style.display = "none"; // hide profile button
}

