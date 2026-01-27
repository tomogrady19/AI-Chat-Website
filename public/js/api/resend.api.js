import { API_BASE_URL } from "./config.js";

export async function sendEmail(emailContent) {
    const res = await fetch(`${API_BASE_URL}/api/resend/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailContent })
    });
    if (!res.ok) {
        console.error("Email request failed", res.status);
        alert("Request failed");
        return;
    }
    return true;
}