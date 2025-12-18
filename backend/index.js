import app from "./app.js";

app.listen(3000, () => {
  console.log("Running at http://127.0.0.1:3000");
});

console.log("Spotify OAuth at http://127.0.0.1:3000/auth/spotify/login");
// npm run start