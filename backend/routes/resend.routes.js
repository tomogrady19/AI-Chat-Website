import express from "express";
import { Resend } from "resend";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/request-access", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await resend.emails.send({
            from: "Spotify Insights <onboarding@resend.dev>",
            to: process.env.RESEND_EMAIL,
            subject: "New Spotify API access request",
            text: `A user has requested access to the Spotify API:\n\n${email}`
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Resend error:", err);
        res.status(500).json({ message: "Failed to send request email" });
    }
});

export default router;
