import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: 60 * 1000, // 1 minutes window
  max: 5, // 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false
});
