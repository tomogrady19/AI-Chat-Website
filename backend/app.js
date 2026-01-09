import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

import sessionMiddleware from "./config/session.js";
import aiRoutes from "./routes/ai.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import resendRoutes from "./routes/resend.routes.js";
import { generalLimiter, aiLimiter } from "./middleware/rateLimiters.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: ["https://spotify-insights.com", "https://www.spotify-insights.com"],
    credentials: true
}));

app.use(sessionMiddleware);

app.use(cookieParser());
app.use(express.json({ limit: "20kb" })); // enforce json file size limit globally
app.use(express.static("public"));

// give all requests an ID
app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader("X-Request-ID", req.id);
    console.info(`[${req.id}] ${req.method} ${req.originalUrl}`);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get(["/", "/demo"], (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

//TODO should I generalise the way I access these routes?
app.use("/api", generalLimiter);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/resend", resendRoutes);

export default app;