console.log("Loaded: playback.js");
import { fetchPlaybackToken, fetchPlayer, fetchUser } from "./api/api.js";
import { showNotPremium } from "./ui/ui.js";

const isDemo = window.location.pathname === "/demo";

// define globally here so they can be updated by separate functions without returning them explicitly
let user = null; //TODO maybe cache user so fetchUser isn't called as much
let player = null;
let previewAudio = null;
let deviceId = null;
let accessToken = null;
let initPromise = null;
let currentTrack = null;
let isPaused = true;
let spotifySDKReadyResolve;
let deviceIdResolve;

window.onSpotifyWebPlaybackSDKReady = () => {
    if (spotifySDKReadyResolve) spotifySDKReadyResolve();
};

function waitForSpotifySDK() { //TODO maybe add timeout to match devideID waiter helper function
    return new Promise((resolve) => {
        if (window.Spotify?.Player) return resolve();
        spotifySDKReadyResolve = resolve;
    });
}

function waitForDeviceId(timeoutMs = 3000) {
    return new Promise((resolve) => {
        if (deviceId) return resolve(deviceId);

        const timeout = setTimeout(() => {
            deviceIdResolve = null;
            resolve(null);
        }, timeoutMs);

        deviceIdResolve = (id) => {
            clearTimeout(timeout);
            resolve(id);
        };
    });
}

async function transferPlaybackHere() {
    const res = await fetch("https://api.spotify.com/v1/me/player", {
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
    if (!res.ok){
        console.error("playback transfer error");
        alert("Playback Not Available");
        return false
    }
    return true;
}

export async function initPlayback() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const tokenData = await fetchPlaybackToken();
        if (!tokenData) {
            return false;
        }
        accessToken = tokenData.accessToken;

        await waitForSpotifySDK();

        player = new window.Spotify.Player({
            name: "Spotify AI Insights Player",
            getOAuthToken: (cb) => cb(accessToken),
            volume: 0.6
        });

        player.addListener("ready", async ({ device_id }) => {
            deviceId = device_id;

            if (deviceIdResolve) {
                deviceIdResolve(deviceId);
                deviceIdResolve = null;
            }

            const transferred = await transferPlaybackHere();
            if (!transferred) {
                player.disconnect();
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
        if (!connected) {
            alert("Playback Not Available");
            initPromise = null;
            return false;
        }

        return true;
    })();

    return initPromise;
}

async function playTrackById(trackId) {
    await initPlayback();

    await waitForDeviceId();
    if (!deviceId) {
        alert("Playback Not Available");
        return;
    }

    // Try play
    let res = await fetchPlayer(deviceId, trackId, accessToken)

    // If token expired, refresh once and retry
    if (res.status === 401) {
        const tokenData = await fetchPlaybackToken();
        if (!tokenData) {
            return;
        }
        accessToken = tokenData.accessToken;
        res = await fetchPlayer(deviceId, trackId, accessToken)
    }

    if (!res.ok) {
        alert("Playback Not Available");
        return;
    }
}

export async function playTrack(trackId) {
    user = await fetchUser();
    if (!user) return;
    if (user.product !== "premium") {
        showNotPremium();
        return;
    }
    await playTrackById(trackId);
    document.getElementById("toggle-play").textContent = "⏸";
}

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

export function playPreview(previewUrl, btn) {
    playPreviewByUrl(previewUrl);
    document.getElementById("toggle-play").textContent = "⏸";
    isPaused = false;
    updateNowPlaying(btn);
}

export async function togglePlayPause() {
    const button = document.getElementById("toggle-play");
    if (isDemo) {
        if (!previewAudio) return;
        if (isPaused) {
            previewAudio.play();
            button.textContent = "⏸";
            isPaused = false;
        } else {
            previewAudio.pause();
            button.textContent = "▶";
            isPaused = true;
        }
    } else {
        user = await fetchUser();
        if (!user) return;
        if (user.product !== "premium"){
            showNotPremium();
            return;
        }

        await initPlayback();
        if (!player) return;

        if (isPaused) {
            await player.resume();
            button.textContent = "⏸"; //TODO could be moved to ui in future
        } else {
            await player.pause();
            button.textContent = "▶";
        }
    }
}

function updateNowPlaying(btn=null) {
    const el = document.getElementById("now-playing");
    if (!el) return;

    if (isDemo) {
        el.textContent = `${btn.dataset.name} — ${btn.dataset.artists}`;
    } else {
        if (!currentTrack) {
            el.textContent = "";
            return;
        }

        el.textContent = `${currentTrack.name} — ${currentTrack.artists}`;
    }
}