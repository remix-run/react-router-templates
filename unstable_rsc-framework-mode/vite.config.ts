import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // Experimental RSC plugins
    reactRouterRSC(),
    rsc(),
    // Chrome DevTools support
    devtoolsJson(),
  ],
});
