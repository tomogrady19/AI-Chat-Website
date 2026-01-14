import jwt from "jsonwebtoken";

// issue a JWT if user logs into Spotify
export function issueJwt({ spotifyId }) {
    if (!spotifyId) throw new Error("Missing spotifyId for JWT");

    return jwt.sign(
        { spotifyId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}