import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve("renderer"),
  plugins: [react()],
  build: {
    outDir: path.resolve("dist-renderer"),
    emptyOutDir: true,
  },
});
