import { defineConfig } from "vitest/config";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Poyo",
        short_name: "Poyo",
        theme_color: "#E6E9EC",
        background_color: "#E6E9EC",
        display: "standalone",
        icons: [{ src: "/icone-512.png", sizes: "512x512", type: "image/png" }],
      },
    }),
  ],
  test: { environment: "jsdom" },
});