export function getTimeRange(req) {
    const allowedRanges = new Set(["short_term", "medium_term", "long_term"]);
    const requested =
        req.body?.timeRange ??
        req.query?.timeRange;
    return allowedRanges.has(requested) ? requested : "medium_term";
}