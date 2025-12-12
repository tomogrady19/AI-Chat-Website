export function setupEventListeners({ onAsk }) {
    const input = document.getElementById("userInput");
    const askButton = document.getElementById("askButton");

    // Enter / Shift+Enter handling
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onAsk();
        }
    });

    // Auto-grow textarea
    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
    });

    // Ask button click
    askButton.addEventListener("click", onAsk);
}
