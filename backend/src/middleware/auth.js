import jwt from "jsonwebtoken";

export function requireAuth(req) {
    const token = req.cookies?.auth_token;

    if (!token) {
        const err = new Error('Log into Spotify to continue');
        err.status = 401;
        throw err;
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return req.user;
    } catch {
        const err = new Error('Session expired. Please log into Spotify to continue');
        err.status = 401;
        throw err;
    }
}