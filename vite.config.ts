import { defineConfig } from "vitest/config";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Tauri définit TAURI_ENV_PLATFORM pendant ses builds. Dans l'APK, la PWA
// (service worker) est inutile et peut faire écran blanc → on la garde pour
// le web seulement.
const dansTauri = !!process.env.TAURI_ENV_PLATFORM;

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    ...(dansTauri
      ? []
      : [
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
        ]),
  ],
  test: { environment: "jsdom" },
});