import { issueJwt } from "../utils/jwt.js";
import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {
    const user = await authenticateUser(req.body);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = issueJwt(user);

    res.json({ token });
});
