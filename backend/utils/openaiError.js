export function handleOpenAIError(err, req, res) {
    console.error(`[${req.id}] OpenAI error`, err?.response?.data || err);

    if (err?.status === 401) {
        return res.status(400).json({
            error: "Invalid OpenAI API key",
            requestId: req.id
        });
    }

    if (err?.status === 429) {
        return res.status(429).json({
            error: "Rate limit exceeded. Try again later.",
            requestId: req.id
        });
    }

    if (err?.status === 400) {
        return res.status(400).json({
            error: "Invalid request sent to OpenAI",
            requestId: req.id
        });
    }

    return res.status(500).json({
        error: "Unexpected AI service error",
        requestId: req.id
    });
}
