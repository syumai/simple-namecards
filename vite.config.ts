import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/simple-namecards/",
  build: {
    outDir: "dist",
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    includeSource: ["src/**/*.{js,ts,tsx}"],
  },
});
