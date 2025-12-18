export function buildMusicProfilePrompt({ artists, tracks }) {
    const artistNames = artists.map(a => a.name).join(", ");
    const genres = [...new Set(artists.flatMap(a => a.genres))].slice(0, 10);
    const trackSummaries = tracks.map(t => `${t.name} by ${t.artists.map(a => a.name).join(", ")}`);

    return `
        Please format your response with:
        - Clear section headings
        - One artist or song per line
        - Blank lines between sections
        
        The user’s music taste is based on Spotify listening data.
        Top artists: ${artistNames}
        Common genres: ${genres.join(", ")}
        Top tracks: ${trackSummaries.join("\n")}
        
        Based on this, respond with the following format:
        "Based on your music taste, here are some recommendations!"/n
        **Artists you might like**:/n
        {list 5 artists here (zero line breaks)}/n
        **Tracks you might like**:/n
        {list 5 tracks here (zero line breaks)}/n
        
        {Give a brief one sentence explanation of what these recommendations have in common with their taste}/n
        {Offer to answer any follow up questions they have}/n
        `;
}