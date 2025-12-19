// could later be used for production cookies or a Redis/Mongo DB session store
import session from "express-session";

const isProd = process.env.NODE_ENV === "production";

export default session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60, // 1 hour
  }
});
