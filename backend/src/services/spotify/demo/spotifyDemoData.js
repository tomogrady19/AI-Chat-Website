import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoTopArtists = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../demo_data/top-artists.json"), "utf-8"));
const demoTopTracks = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../demo_data/top-tracks.json"), "utf-8"));
const demoRecentlyPlayed = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../demo_data/recently-played.json"), "utf-8"));

export function getDemoSpotifyProfile() {
    return {
        artists: demoTopArtists.items ?? [],
        tracks: demoTopTracks.items ?? [],
        recent: demoRecentlyPlayed.items ?? [],
    };
}
