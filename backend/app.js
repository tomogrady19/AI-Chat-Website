import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";

import sessionMiddleware from "./config/session.js";
import aiRoutes from "./routes/ai.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";
import { generalLimiter, aiLimiter } from "./middleware/rateLimiters.js";

const app = express();

app.use(sessionMiddleware);

app.use(cookieParser());
app.use(express.json({ limit: "100kb" })); // enforce json file size limit globally
app.use(express.static("public"));

app.use("/api", generalLimiter);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/", spotifyRoutes);

export default app;