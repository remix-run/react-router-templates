import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { reactRouterDevTools } from "react-router-devtools";

export default defineConfig({
  plugins: [reactRouterDevTools(), reactRouter(), tailwindcss()],
});
