import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";

import build from "./dist/rsc/index.js";

const app = express();

app.use(
  "/assets",
  compression(),
  express.static("dist/client/assets", {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(compression(), express.static("dist/client"));

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404);
  res.end();
});

const listener = createRequestListener(build);
app.use((req, res, next) => {
  const url = new URL(req.url, `http://localhost/`);
  if (url.pathname.endsWith(".rsc") || url.pathname.endsWith(".manifest")) {
    return listener(req, res, next);
  }
  next();
});

app.use((req, res) => {
  // send "dist/client/index.html" for all other requests
  res.sendFile("dist/client/index.html", {
    root: process.cwd(),
  });
});

const PORT = Number.parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
});
