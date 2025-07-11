import * as fsp from "node:fs/promises";

import rsc from "@vitejs/plugin-rsc/plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "dev-server",
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            try {
              const url = new URL(req.url || "/", `http://${req.headers.host}`);

              if (
                url.pathname.endsWith(".rsc") ||
                url.pathname.endsWith(".manifest")
              ) {
                return next();
              }

              const transformed = await server.transformIndexHtml(
                url.pathname,
                await fsp.readFile("index.html", "utf-8")
              );
              res.end(transformed);

              // server.transformIndexHtml(url.pathname);
            } catch (error) {
              next(error);
            }
          });
        };
      },
    },
    rsc({
      entries: {
        rsc: "src/entry.rsc.tsx",
      },
    }),
    devtoolsJson(),
  ],
});
