import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({ message: "Log into Spotify to continue" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: "Session Expired. Please log into Spotify to continue" });
    }
}