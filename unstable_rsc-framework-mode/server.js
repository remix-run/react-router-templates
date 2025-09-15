import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";

const viteDevServer =
  process.env.NODE_ENV === "development"
    ? await import("vite").then(({ createServer }) =>
        createServer({
          server: {
            middlewareMode: true,
          },
        }),
      )
    : undefined;

const app = express();

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404);
  res.send("Not Found");
});

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(express.static("build/client"));
  app.all(
    "*",
    createRequestListener((await import("./build/server/index.js")).default),
  );
}

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Server listening on port ${port} (http://localhost:${port})`);
