import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";

import sessionMiddleware from "./config/session.js";

import metaRoutes from "./routes/meta.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import resendRoutes from "./routes/resend.routes.js";

import { generalLimiter, aiLimiter } from "./middleware/rateLimiters.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

// Express middleware execution order:
// 1. Security & parsing
// 2. Request identification & logging
// 3. Session handling (must come before routes that use req.session)
// 4. Rate limiting
// 5. Routes
// 6. Error handling (last)

// CORS and request parsing before middleware that relies on headers, body, or cookies
app.use(cors({
    origin: ["https://spotify-insights.com", "https://www.spotify-insights.com"],
    credentials: true
}));

// Attach a unique request ID for logging and traceability
app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader("X-Request-ID", req.id);
    console.info(`[${req.id}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cookieParser());
app.use(express.json({ limit: "20kb" })); // enforce json file size limit globally
app.use("/", metaRoutes);
app.use(express.static("public"));

// Session middleware must be registered before any route that reads or writes req.session
app.use(sessionMiddleware);

// Rate limiting is applied after sessions so limits can be session-aware if needed
app.use("/api", generalLimiter);

// Application routes
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/resend", resendRoutes);

// Centralised error handler — must be the last middleware
app.use(errorHandler);

export default app;