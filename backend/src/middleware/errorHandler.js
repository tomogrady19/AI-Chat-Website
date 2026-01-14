export function errorHandler(err, req, res, next) {
    console.error(err); //TODO log req ID to console?

    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
}
