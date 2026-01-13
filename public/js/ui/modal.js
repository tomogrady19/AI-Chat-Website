// close modal overlay
export function closeModal() {
    document.getElementById("demoBtn").focus();
    const modal = document.getElementById("modal");
    modal.classList.add("hidden");
    modal.setAttribute("inert", "");
    modal.setAttribute("aria-hidden", "true");
}

// open modal overlay
export function openModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    modal.removeAttribute("inert");
    modal.removeAttribute("aria-hidden");
    document.getElementById("modalCancelBtn").focus();
}