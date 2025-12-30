import { login, logout } from "../api.js"
import { clearUI } from "./clear.js"
import { showProfile } from "./profile.js"

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
    authBtn.textContent = "Log out";
    spotifySwitchBtn.style.display = "inline-block"; //display switch button
}

export function showLoggedOut() {
    const authBtn = document.getElementById("spotifyAuthBtn");
    const spotifySwitchBtn = document.getElementById("spotifySwitchBtn");
    authBtn.textContent = "Log in with Spotify";
    spotifySwitchBtn.style.display = "none"; // hide switch button
}