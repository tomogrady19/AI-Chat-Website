export const isDemo = window.location.pathname === "/demo";
const isDev = window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isDev ? "" : "https://api.spotify-insights.com";