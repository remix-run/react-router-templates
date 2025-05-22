import { reactRouter } from "@react-router/dev/vite";
import deno from "@deno/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [reactRouter(), deno(), tailwindcss()],
  build: {
    target: "ESNext",
  },
  resolve: {
    alias: {
      "~/": new URL("./app/", import.meta.url).pathname,
      ...(command === "build"
        ? {
          "react-dom/server": "react-dom/server.node",
        }
        : {}),
    },
  },
}));
