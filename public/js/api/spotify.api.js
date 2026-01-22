const isDemo = window.location.pathname === "/demo";

const API_BASE_URL =
    window.location.hostname === "127.0.0.1"
    ? "" //"http://localhost:3000"
    : "https://api.spotify-insights.com";

export async function fetchProfile() {
    const timeRange = document.getElementById("timeRange").value;
    const demoParam = isDemo ? "&mode=demo" : "";
    const res = await fetch(`${API_BASE_URL}/api/spotify/profile?timeRange=${timeRange}${demoParam}`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        console.error("Profile fetch failed", res.status);
        alert("Unexpected error")
        return null;
    }

    return await res.json();
}

export async function fetchUser() {
    if (isDemo) return { authenticated: false };
    const res = await fetch(`${API_BASE_URL}/api/spotify/user`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        console.error("User fetch failed", res.status);
        alert("Unexpected error")
        return null;
    }

    return await res.json();
}

export async function logout() {
    if (isDemo) return;
    const res = await fetch(`${API_BASE_URL}/api/spotify/logout`, {
        method: "GET",
        credentials: "include"
    });
    window.location.href = "/"; // redirect
}

export async function login() {
    if (isDemo) return;
    window.location.href = `${API_BASE_URL}/api/spotify/login`;
}

export async function switchAccount() {
    if (isDemo) return;
    window.location.href = `${API_BASE_URL}/api/spotify/switch`;
}

export async function fetchPlaybackToken() {
    const res = await fetch(`${API_BASE_URL}/api/spotify/playback-token`, {
        method: "GET",
        credentials: "include"
    });
    if (!res.ok) {
        console.error("Token fetch failed", res.status);
        alert("Unexpected error")
        return null;
    }
    return await res.json();
}

export async function fetchPlayer(deviceId, trackId, accessToken) {
    return await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json"},
        body: JSON.stringify({uris: [`spotify:track:${trackId}`]})
    });
}