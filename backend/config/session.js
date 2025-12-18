// unused right now but should be useful later

import session from "express-session";

export default session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-later",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    httpOnly: true
  }
});
