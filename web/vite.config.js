import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";

const isGHPages = process.env.DEPLOY_TARGET === "ghpages";

export default defineConfig({
  base: isGHPages ? "/sz-scoreweb/" : "/",
  plugins: [react(), commonjs()],
  server: {
    host: "0.0.0.0"
  }
});
