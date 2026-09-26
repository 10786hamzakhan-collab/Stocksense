import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
  build: {
    cssMinify: false,
  },
});