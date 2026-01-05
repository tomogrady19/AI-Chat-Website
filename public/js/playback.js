console.log("Loaded: playback.js");
import { fetchPlaybackToken, fetchPlayer } from "./api.js";

// define globally here so they can be updated by separate functions without returning them explicitly
let player = null;
let deviceId = null;
let accessToken = null;
let initPromise = null;
let currentTrack = null;
let isPaused = true;
let spotifySDKReadyResolve;

window.onSpotifyWebPlaybackSDKReady = () => {
    if (spotifySDKReadyResolve) spotifySDKReadyResolve();
};

function waitForSpotifySDK() {
    return new Promise((resolve) => {
        if (window.Spotify?.Player) return resolve();
        spotifySDKReadyResolve = resolve;
    });
}

async function transferPlaybackHere() {
    await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            device_ids: [deviceId],
            play: false
        })
    });
}

export async function initPlayback() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const tokenData = await fetchPlaybackToken();
        accessToken = tokenData.accessToken;

        await waitForSpotifySDK();

        player = new window.Spotify.Player({
            name: "Spotify AI Insights Player",
            getOAuthToken: (cb) => cb(accessToken),
            volume: 0.6
        });

        player.addListener("ready", async ({ device_id }) => {
            deviceId = device_id;
            try {
                await transferPlaybackHere();
                console.log("Web Playback SDK ready. Device:", deviceId);
            } catch (e) {
                console.warn("Could not transfer playback:", e);
            }
        });

        player.addListener("initialization_error", ({ message }) => console.error(message));
        player.addListener("authentication_error", ({ message }) => console.error(message));
        player.addListener("account_error", ({ message }) => console.error(message));
        player.addListener("playback_error", ({ message }) => console.error(message));
        player.addListener("player_state_changed", (state) => {
            if (!state) return;
            isPaused = state.paused;

            const track = state.track_window.current_track;
            if (track) {
                currentTrack = {
                    name: track.name,
                    artists: track.artists.map(a => a.name).join(", ")
                };
                updateNowPlaying();
            }
        });

        const connected = await player.connect();
        if (!connected) throw new Error("Spotify player could not connect");

        return true;
    })();

    return initPromise;
}

async function playTrackById(trackId) {
    // Ensure player exists
    await initPlayback();
    // If deviceId is still null, wait a bit for it to be set
    for (let i = 0; i < 5 && !deviceId; i++) {
        await new Promise((r) => setTimeout(r, 200));
    }
    if (!deviceId) throw new Error("Spotify player not ready yet");

    // Try play
    let res = await fetchPlayer(deviceId, trackId, accessToken)

    // If token expired, refresh once and retry
    if (res.status === 401) {
        const tokenData = await fetchPlaybackToken();
        accessToken = tokenData.accessToken;
        res = await fetchPlayer(deviceId, trackId, accessToken)
    }

    if (res.status === 204) return; // success

    if (!res.ok) {
        let text = "";
        try { text = await res.text(); } catch {}
        throw new Error(`Play failed: ${res.status} ${text}`);
    }
}

export async function playTrack(trackId) {
    try {
        await playTrackById(trackId);
        document.getElementById("toggle-play").textContent = "⏸";
    } catch (err) {
        console.error(err);
        alert(err.message || "Playback failed (Premium required for in-app playback).");
    }
}

let previewAudio = null;
function playPreviewByUrl(previewUrl) {
    if (!previewUrl) {
        alert("No preview available for this track");
        return;
    }

    // stop previous preview so they don't both play
    if (previewAudio) {
        previewAudio.pause();
        previewAudio = null;
    }

    previewAudio = new Audio(previewUrl);
    previewAudio.volume = 0.8;
    previewAudio.play();
}

export function playPreview(previewUrl) {
    playPreviewByUrl(previewUrl);
    document.getElementById("toggle-play").textContent = "⏸";
}

export async function togglePlayPause() {
    await initPlayback();
    if (!player) throw new Error("Player not ready");

    const button = document.getElementById("toggle-play")
    if (isPaused) {
        await player.resume();
        button.textContent = "⏸"; //TODO could be moved to ui in future
    } else {
        await player.pause();
        button.textContent = "▶";
    }
}

function updateNowPlaying() {
    const el = document.getElementById("now-playing");
    if (!el) return;

    if (!currentTrack) {
        el.textContent = "";
        return;
    }

    el.textContent = `${currentTrack.name} — ${currentTrack.artists}`;
}