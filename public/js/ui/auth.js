import { fetchUser, login, logout } from "../api/api.js"
import { clearUI } from "./clear.js"

export async function toggleSpotifyAuth() {
    const user = await fetchUser();
    if (user) {
        await logout();
        showLoggedOut();
    } else {
        await login(); // login will redirect you to spotify, so showProfile and showLoggedIn are dealt with in init()
    }
}

export function showLoggedIn() {
    document.getElementById("demoBtn").classList.add("is-hidden"); // hide try demo button
    document.getElementById("requestAccessBtn").classList.add("is-hidden"); // hide request access button
    document.getElementById("spotifySwitchBtn").classList.remove("is-hidden"); //display switch button;

    document.getElementById("spotify-auth").classList.add("is-logged-in");
    document.getElementById("spotifyAuthBtn").textContent = "Log out";
    document.querySelector(".hero-subtitle").textContent = "You're logged in! Try changing the time range and playing some of your songs!";;

}

export function showLoggedOut() {
    document.getElementById("demoBtn").classList.remove("is-hidden"); // display try demo button
    document.getElementById("requestAccessBtn").classList.remove("is-hidden"); // display request access button
    document.getElementById("spotifySwitchBtn").classList.add("is-hidden");; // hide switch button;

    document.getElementById("spotify-auth").classList.remove("is-logged-in");
    const authBtn = document.getElementById("spotifyAuthBtn");
    authBtn.textContent = "Log in with Spotify";
    authBtn.classList.remove("is-hidden");

    const subtitleMessage = document.querySelector(".hero-subtitle");
    subtitleMessage.textContent = "Spotify accounts require manual approval during development.\n(You must request access before logging in)\n\nYou can still explore everything in demo mode.";
    clearUI();
}