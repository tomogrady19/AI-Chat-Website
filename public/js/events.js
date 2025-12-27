export function setupEventListeners({ onAsk, onClear, onToggleAssistant, onProfile, onRecommend, onSpotifyAuth }) {
    const input = document.getElementById("userInput");
    const askButton = document.getElementById("askButton");
    const clearButton = document.getElementById("clearButton");
    const toggleAssistantButton = document.getElementById("assistant-toggle");
    const spotifyAuthButton = document.getElementById("spotifyAuthBtn");
    const profileButton = document.getElementById("spotify-profile");
    const recommendButton = document.getElementById("recommendButton");

    // Enter / Shift+Enter handling
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onAsk();
        }
    });

    // Auto-grow textarea as input grows
    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
    });

    // Ask button click
    askButton.addEventListener("click", onAsk); // when askButton is clicked, call relevant function
    clearButton.addEventListener("click", onClear); // when clearButton is clicked, call relevant function
    toggleAssistantButton.addEventListener("click", onToggleAssistant);
    spotifyAuthButton.addEventListener("click", onSpotifyAuth);
    profileButton.addEventListener("click", onProfile);
    recommendButton.addEventListener("click", onRecommend);
}
