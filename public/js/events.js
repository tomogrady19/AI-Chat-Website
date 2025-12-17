export function setupEventListeners({ onAsk, onClear, onToggle, onArtists, onTracks, onRecommend }) {
    const input = document.getElementById("userInput");
    const askButton = document.getElementById("askButton");
    const clearButton = document.getElementById("clearButton");
    const toggleButton = document.getElementById("assistant-toggle");
    const artistButton = document.getElementById("spotify-artists");
    const tracksButton = document.getElementById("spotify-tracks")
    const recommendButton = document.getElementById("RecommendButton")
    // TODO make naming convention consistent

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
    toggleButton.addEventListener("click", onToggle);
    artistButton.addEventListener("click", onArtists);
    tracksButton.addEventListener("click", onTracks);
    recommendButton.addEventListener("click", onRecommend);
}
