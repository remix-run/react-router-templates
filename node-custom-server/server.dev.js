import * as vite from "vite";
import express from "express";

const PORT = Number.parseInt(process.env.PORT || "3000");
const app = express();

console.log("Starting development server");

const viteDevServer = await vite.createServer({
  server: { middlewareMode: true },
});
// `vite.middlewares` is a Connect instance which can be used as a middleware
// in any connect-compatible Node.js framework.
// https://vite.dev/guide/ssr#setting-up-the-dev-server
app.use(viteDevServer.middlewares);

viteDevServer
  // `ssrLoadModule` automatically transforms ESM source code without bundling,
  // enabling live refresh of changed modules similar to Hot Module Reloading.
  .ssrLoadModule("./server/app.ts")
  .then((source) => {
    // Here, `source` is effectively behaving like:
    // `import * as source from 'server/app.ts'`
    app.use(source.app);
  })
  .catch((error) => {
    if (typeof error === "object" && error instanceof Error) {
      viteDevServer.ssrFixStacktrace(error);
    }
    console.log({ error });
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
