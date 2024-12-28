import express from "express";

import { app as rrApp } from "./build/server/index.js";

const PORT = Number.parseInt(process.env.PORT || "3000");
const app = express();

console.log("Starting production server");
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
);
app.use(express.static("build/client", { maxAge: "1h" }));
app.use(rrApp);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
