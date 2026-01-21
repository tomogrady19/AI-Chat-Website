export function errorHandler(err, req, res, next) {
    console.error(`[${req.id}]`, err);

    const status = err.status || 500;
    // Expose messages if it's a client side error
    const expose = err.expose === true || (status >= 400 && status < 500);
    res.status(status).json({
        error: expose ? (err.message || "Request failed") : "Internal server error",
        requestID: req.id
    });
}
