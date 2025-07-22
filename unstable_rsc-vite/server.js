/*
 * Example deployment configuration to serverless environment e.g Vercel
 *
 */

import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Dynamic import for the RSC build
let build;
try {
  // Import the built RSC app
  const buildModule = await import("./dist/rsc/index.js");
  build = buildModule.default || buildModule;
} catch (error) {
  console.error("Failed to load RSC build:", error);
  throw error;
}

// Middleware
app.use(compression());

// Serve static assets with caching
app.use(
  "/assets",
  express.static(join(__dirname, "./dist/client/assets"), {
    immutable: true,
    maxAge: "1y",
  }),
);

// Serve other static files
app.use(express.static(join(__dirname, "./dist/client")));

// Handle Chrome DevTools route
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404).end();
});

// Use the RSC request listener for all other routes
app.use(createRequestListener(build));

// Let's Vercel serve this
export default app;
