const isProd = process.env.NODE_ENV === "production";

export async function regenerateSession(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate(err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function clearCookies(res) {
    res.clearCookie("sid", {
        sameSite: isProd ? "none" : "lax",
        ...(isProd && { domain: ".spotify-insights.com" }),
        path: "/",
        secure: isProd
    });

    res.clearCookie("auth_token", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        ...(isProd && { domain: ".spotify-insights.com" }),
        path: "/",
        secure: isProd
    });
}