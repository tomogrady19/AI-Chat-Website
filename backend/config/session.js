// could later be used for production cookies or a Redis/Mongo DB session store
import session from "express-session";

export default session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    httpOnly: true
  }
});
