// could later be used for production cookies or a Redis/Mongo DB session store

// - Sessions: used for server-side state (e.g. Spotify auth state, demo mode, transient user context)
// - JWTs: used for stateless authentication / identity where required

import session from "express-session";

const isProd = process.env.NODE_ENV === "production";

export default session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
//    proxy: true,
    cookie: {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd, //TODO maybe hardcode this as true?
        maxAge: 1000 * 60 * 60, // 1 hour
    }
});
