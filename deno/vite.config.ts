import { reactRouter } from "@react-router/dev/vite";
import deno from "@deno/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter(), deno(), tailwindcss()],
  environments: {
    ssr: {
      build: {
        target: "ESNext",
      },
      resolve: {
        conditions: ["deno"],
        externalConditions: ["deno"],
      },
    },
  },
});
