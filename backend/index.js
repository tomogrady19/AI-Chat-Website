import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// npm run start
// http://127.0.0.1:3000