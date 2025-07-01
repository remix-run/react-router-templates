import rsc from "@hiogawa/vite-rsc/plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    rsc({
      entries: {
        client: "src/browser.tsx",
        rsc: "src/server.tsx",
        ssr: "src/prerender.tsx",
      },
    }),
    devtoolsJson(),
  ],
});
