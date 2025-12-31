import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Running at http://127.0.0.1:3000");
});

// npm run start

// debug tools
// console.error("name:", err?.name);
// console.error("message:", err?.message);
// console.error("stack:", err?.stack);
// console.error("writableEnded:", res.writableEnded);
// throw err;