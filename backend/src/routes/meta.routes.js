import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, '../../../')
const publicDir = path.join(rootDir, 'public')

const router = express.Router();

router.get(["/", "/demo"], (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

router.get("/health", (req, res) => {
    res.status(200).send("OK");
});

export default router;