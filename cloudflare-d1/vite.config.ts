import { vitePluginViteNodeMiniflare } from "@hiogawa/vite-node-miniflare";
import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: {
            "index.js": "virtual:react-router/server-build",
            "worker.js": "./workers/app.ts",
          },
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  ssr: {
    target: "webworker",
    noExternal: true,
    external: ["node:async_hooks"],
    resolve: {
      conditions: ["workerd", "browser"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom",
        "react-dom/server",
        "react-router",
      ],
    },
  },
  plugins: [
    vitePluginViteNodeMiniflare({
      entry: "./workers/app.ts",
      miniflareOptions: (options) => {
        options.compatibilityDate = "2024-11-18";
        options.compatibilityFlags = ["nodejs_compat"];
        options.d1Databases = { DB: "your-database-id" };
        // match where wrangler applies migrations to
        options.d1Persist = ".wrangler/state/v3/d1";
      },
    }),
    reactRouter(),
    {
      name: "react-router-cloudflare-workers",
      config: () => ({
        build: {
          rollupOptions: isSsrBuild
            ? {
                output: {
                  entryFileNames: "[name]",
                },
              }
            : undefined,
        },
      }),
    },
    tsconfigPaths(),
  ],
}));
