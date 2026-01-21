import jwt from "jsonwebtoken";

// issue a JWT if user logs into Spotify
export function issueJwt({ spotifyId }) {
    if (!spotifyId) {
        const err = new Error("Internal auth error");
        err.status = 500;
        err.expose = false;
        throw err;
    }

    return jwt.sign(
        { spotifyId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}