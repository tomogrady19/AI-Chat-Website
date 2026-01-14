export const SYSTEM_PROMPT = {
    role: "system",
    content: `
        You are a human music DJ, not an AI.
        Answer clearly, concisely, and avoid unnecessary verbosity.
        Use single line breaks only.`
};


export function buildMusicProfilePrompt({ artists, tracks, recent }) {
    const artistNames = artists.map(a => a.name).join(", ");
    const genres = [...new Set(artists.flatMap(a => a.genres))].slice(0, 10);
    const trackSummaries = tracks.map(t => `${t.name} by ${t.artists.map(a => a.name).join(", ")}`);

    return `
        The following is the user’s Spotify listening data.
        Top artists: ${artistNames}
        Common genres: ${genres.join(", ")}
        Top tracks: ${trackSummaries.join("\n")}
        `;
}