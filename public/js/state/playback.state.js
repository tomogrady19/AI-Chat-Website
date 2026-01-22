import { fetchPlaybackToken, fetchPlayer } from "../api/api.js";

const isDemo = window.location.pathname === "/demo";

let player;
let deviceId = null;
let accessToken = null;
let initPromise = null;
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

    return res.ok;
}

export async function initPlayback() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const tokenData = await fetchPlaybackToken();
        if (!tokenData) return false;

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
            if (!transferred) player.disconnect();
        });

        const connected = await player.connect();
        if (!connected) {
            initPromise = null;
            return false;
        }

        return true;
    })();

    return initPromise;
}

export async function playTrackById(trackId) {
    await initPlayback();

    const id = await waitForDeviceId();
    if (!id) return false;

    let res = await fetchPlayer(deviceId, trackId, accessToken);

    if (res.status === 401) {
        const tokenData = await fetchPlaybackToken();
        if (!tokenData) return false;

        accessToken = tokenData.accessToken;
        res = await fetchPlayer(deviceId, trackId, accessToken);
    }

    return res.ok;
}

export async function togglePlayback() {
    if (!player) return false;

    const state = await player.getCurrentState();
    if (!state) return false;

    if (state.paused) await player.resume();
    else await player.pause();

    return true;
}