import { checkAuthStatus, login, logout } from "../api.js"
import { clearUI } from "./clear.js"

export async function initAuth() {
    try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
            showLoggedIn();
        } else {
            showLoggedOut();
        }
        return isLoggedIn;
    } catch (err) {
        console.error("Auth check failed:", err);
        showLoggedOut();
        return false;
    }
}

export async function toggleSpotifyAuth() {
    const isLoggedIn = await checkAuthStatus();
    if (isLoggedIn) {
        await logout();
        showLoggedOut();
    } else {
        await login(); // login will redirect you to spotify, so showProfile and showLoggedIn are dealt with in init()
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
    subtitleMessage.textContent = "Log in with Spotify to see your listening data and get recommendations from the AI assistant.\nIf you’re unable to log in due to Spotify API limitations, you can explore the app using demo mode.";
    subtitleMessage.style.fontSize = "1.2rem";
    clearUI();
}