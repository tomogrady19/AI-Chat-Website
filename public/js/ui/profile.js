import { fetchProfile } from "../api.js";

export async function showProfile() {
    try {
        const data = await fetchProfile();
        renderTopArtists(data.artists);
        renderTopTracks(data.tracks);
        renderRecent(data.recent);
    } catch (err) {
        if (err.code === 401) {
            console.log("Spotify not authenticated yet");
            return;
        }
        console.error(err)
        alert("Something went wrong loading your Spotify data")
    }
}

function renderTopArtists(artists) {
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

function renderTopTracks(tracks) {
    const container = document.getElementById("tracks-section");
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Your Top Tracks";
    container.appendChild(title);

    const list = document.createElement("ol");
    tracks.forEach(track => {
        const li = document.createElement("li");
        li.className = "track-item";

        const playBtn = createPlayButton(track);
        const img = createImage(track.name, track.album?.images?.[0]?.url);
        const link = createSpotifyLink(`${track.name} — ${track.artists.map(a => a.name).join(", ")}`, track.external_urls?.spotify);

        li.appendChild(playBtn);
        li.appendChild(img);
        li.appendChild(link);

        list.appendChild(li);
    });
    container.appendChild(list);
}

function renderRecent(recent) {
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

        const playBtn = createPlayButton(track);
        const img = createImage(track.name, track.album.images?.[0]?.url);
        const link = createSpotifyLink(`${track.name} — ${track.artists.map(a => a.name).join(", ")}`, track.external_urls.spotify);

        li.appendChild(playBtn);
        li.appendChild(img);
        li.appendChild(link);

        list.appendChild(li);
    });
    container.appendChild(list);
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

function createPlayButton(track) {
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "play-btn";
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", `Play ${track.name}`);
    playBtn.dataset.trackId = track.id;
    playBtn.dataset.previewUrl = track.preview_url
    return playBtn
}
