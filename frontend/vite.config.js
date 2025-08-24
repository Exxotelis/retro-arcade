// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    ...(isProd ? { base: "/" } : {}), // prod: "/", dev: default ("/")
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": "http://localhost:8000", // μόνο dev
      },
    },
    build: {
      outDir: "dist",
      sourcemap: !isProd,
    },
    preview: {
      port: 4173,
    },
  };
});
