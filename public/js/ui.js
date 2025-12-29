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
    container.appendChild(title);

    const list = document.createElement("ol"); // ordered list
    artists.forEach(artist => {
        const li = document.createElement("li");
        li.className = "artist-item";

        const img = createImage(artist.name, artist.images?.[0]?.url)
        const link = createSpotifyLink(artist.name, artist.external_urls?.spotify)

        li.appendChild(img);
        li.appendChild(link);

        list.appendChild(li);
    });
    container.appendChild(list);
}

export function renderTopTracks(tracks) {
    const container = document.getElementById("tracks-section");
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Top Tracks";
    container.appendChild(title);

    const list = document.createElement("ol");
    tracks.forEach(track => {
        const li = document.createElement("li");
        li.className = "track-item";

        const img = createImage(track.name, track.album?.images?.[0]?.url)
        const link = createSpotifyLink(`${track.name} — ${track.artists.map(a => a.name).join(", ")}`, track.external_urls?.spotify)

        li.appendChild(img);
        li.appendChild(link);

        list.appendChild(li);
    });
    container.appendChild(list);
}

export function renderRecent(recent) {
    const container = document.getElementById("recent-section");
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Recent Tracks";
    container.appendChild(title);

    const list = document.createElement("ol");
    recent.forEach(recentItem => {
        const li = document.createElement("li");
        li.className = "recent-item";
        const track = recentItem.track;
        const img = createImage(track.name, track.album.images?.[0]?.url)
        const link = createSpotifyLink(`${track.name} — ${track.artists.map(a => a.name).join(", ")}`, track.external_urls.spotify)

        li.appendChild(img);
        li.appendChild(link);

        list.appendChild(li);
    });
    container.appendChild(list);
}

export function showLoggedIn() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const profileBtn = document.getElementById("spotify-profile");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    authBtn.textContent = "Log out";
    profileBtn.style.display = "inline-block"; // display profile button
    spotifySwitchBtn.style.display = "inline-block"; //display switch button
}

export function showLoggedOut() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const profileBtn = document.getElementById("spotify-profile");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    authBtn.textContent = "Log in with Spotify";
    profileBtn.style.display = "none"; // hide profile button
    spotifySwitchBtn.style.display = "none"; // hide switch button
}

function createImage(text, url) {
    const img = document.createElement("img");
    img.src = url || "";
    img.alt = text || "";
    img.loading = "lazy";
    return img;
}

function createSpotifyLink(text, url) {
    const link = document.createElement("a");
    link.textContent = text;
    link.className = "spotify-link";

    if (url) {
        link.href = url;
        link.target = "_blank"; // opens a new tab
        link.rel = "noopener noreferrer"; //privacy and security
    } else {
        link.href = "#";
        link.style.pointerEvents = "none";
    }

    return link;
}

