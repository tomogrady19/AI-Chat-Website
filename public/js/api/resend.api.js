const API_BASE_URL =
    window.location.hostname === "127.0.0.1"
    ? "" //"http://localhost:3000"
    : "https://api.spotify-insights.com";

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