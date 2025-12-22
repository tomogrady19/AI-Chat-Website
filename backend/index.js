import app from "./app.js";

app.listen(3000, () => {
  console.log("Running at http://127.0.0.1:3000");
});

// npm run start

// debug tools
// console.error("name:", err?.name);
// console.error("message:", err?.message);
// console.error("stack:", err?.stack);
// console.error("writableEnded:", res.writableEnded);
// throw err;