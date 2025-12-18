export function buildMusicProfilePrompt({ artists, tracks }) {
  const artistNames = artists.map(a => a.name).join(", ");
  const genres = [...new Set(artists.flatMap(a => a.genres))].slice(0, 10);
  const trackSummaries = tracks.map(
    t => `${t.name} by ${t.artists.map(a => a.name).join(", ")}`
  );

  return `
Top artists: ${artistNames}
Common genres: ${genres.join(", ")}
Top tracks:
${trackSummaries.join("\n")}
`;
}
