export function handleOpenAIError(err, res) {
    console.error("OpenAI error:", err?.response?.data || err);

    if (err?.status === 401) {
        return res.status(500).json({
            error: "Invalid OpenAI API key"
        });
    }

    if (err?.status === 429) {
        return res.status(429).json({
            error: "Rate limit exceeded. Try again later."
        });
    }

    if (err?.status === 400) {
        return res.status(500).json({
            error: "Invalid request sent to OpenAI",
            details: err?.response?.data
        });
    }

    return res.status(500).json({
        error: "Unexpected AI service error"
    });
}
