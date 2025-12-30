import { checkAuthStatus, login, logout } from "../api.js"
import { clearUI } from "./clear.js"
import { showProfile } from "./profile.js"

export async function initAuth() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (!isLoggedIn) {
            showLoggedOut();
        } else {
            showLoggedIn();
        }
        return isLoggedIn;
    } catch (err) {
        console.error("Auth check failed:", err);
        showLoggedOut();
        return false;
    }
}

export async function toggleSpotifyAuth() {
    const spotifyAuthButton = document.getElementById("spotifyAuthBtn");
    if (spotifyAuthButton.textContent.includes("Log out")) { //TODO consider if this is best way
        await logout();
        clearUI();
        showLoggedOut();
    } else {
        await login();
        await showProfile()
        showLoggedIn();
    }
}

export function showLoggedIn() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    const subtitleMessage = document.getElementById("subtitle");
    authBtn.textContent = "Log out";
    spotifySwitchBtn.style.display = "inline-block"; //display switch button
    subtitleMessage.textContent = "You're logged in! Try changing the time range and play some of your songs!";
}

export function showLoggedOut() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    const subtitleMessage = document.getElementById("subtitle");
    authBtn.textContent = "Log in with Spotify";
    spotifySwitchBtn.style.display = "none"; // hide switch button
    subtitleMessage.textContent = "Log in with Spotify to see your listening data, and use the AI assistant to get recommendations based on your taste.";
}