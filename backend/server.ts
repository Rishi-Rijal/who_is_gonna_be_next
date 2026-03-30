import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (_req, res) => {
  res.json({ message: "Express + TypeScript API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
