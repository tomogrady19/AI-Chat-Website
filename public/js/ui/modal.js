const modal = document.getElementById("modal");
const title = document.getElementById("requestAccessTitle");
const help = document.getElementById("requestAccessHelp");
const form = document.getElementById("accessRequestForm");
let lastFocusedElement = null;

// close modal overlay
export function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("inert", "");
    modal.setAttribute("aria-hidden", "true");
    lastFocusedElement?.focus();
}

// open modal overlay
export function openModal() {
    lastFocusedElement = document.activeElement;

    modal.classList.remove("hidden");
    modal.removeAttribute("inert");
    modal.removeAttribute("aria-hidden");
    modal.focus();
}

export function showMessageModal({ titleText, messageText }) {
    // Set content
    title.textContent = titleText;
    help.textContent = messageText;

    // Hide form completely and clear old status text
    form.classList.add("is-hidden");
    openModal();
}

export function showRequestAccessModal() {
    // Restore text
    title.textContent = "Request Spotify access";
    help.textContent ="Enter your email and I’ll add you to the Spotify API allowlist.";

    // Show form again
    form.classList.remove("is-hidden");

    openModal();
}