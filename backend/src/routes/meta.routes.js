import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get(["/", "/demo"], (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'index.html'));
});

router.get("/health", (req, res) => {
    res.status(200).send("OK");
});

export default router;