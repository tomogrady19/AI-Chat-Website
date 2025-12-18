import express from "express";
import "dotenv/config";

import sessionMiddleware from "./config/session.js";
import aiRoutes from "./routes/ai.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

app.use(sessionMiddleware);

app.use(express.json());
app.use(express.static("public"));

app.use("/api/ai", aiRoutes);
app.use("/", spotifyRoutes);

export default app;