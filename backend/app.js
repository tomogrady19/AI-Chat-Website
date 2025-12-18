import express from "express";
import session from "express-session";
import "dotenv/config";

import aiRoutes from "./routes/ai.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

app.use(session({
  secret: "dev-secret-change-later",
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: "lax" }
}));

app.use(express.json());
app.use(express.static("public"));

app.use("/api/ai", aiRoutes);
app.use("/", spotifyRoutes);

export default app;