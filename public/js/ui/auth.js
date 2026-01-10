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
    document.getElementById("requestAccessBtn").classList.add("is-hidden"); // hide request access button
    document.getElementById("spotifySwitchBtn").classList.remove("is-hidden"); //display switch button;

    document.getElementById("spotifyAuthBtn").textContent = "Log out";
    document.getElementById("subtitle").textContent = "You're logged in! Try changing the time range and play some of your songs!";;

}

export function showLoggedOut() {
    document.getElementById("requestAccessBtn").classList.remove("is-hidden"); // display request access button
    document.getElementById("spotifySwitchBtn").classList.add("is-hidden");; // hide switch button;

    const authBtn = document.getElementById("spotifyAuthBtn");
    authBtn.textContent = "Log in with Spotify";
    authBtn.classList.remove("is-hidden");

    const subtitleMessage = document.getElementById("subtitle");
    subtitleMessage.textContent = "Spotify accounts require manual approval during development.\n\nYou can still explore everything in demo mode.";
    clearUI();
}