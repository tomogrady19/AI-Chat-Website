import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes window
    max: 20, // 20 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
          error: "Too many requests. Please wait a moment and try again.",
        });
    },
});

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes window
    max: 10, // 10 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
          error: "Too many AI requests. Please wait a moment and try again.",
        });
    },
});
