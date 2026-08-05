// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // URL canónica del sitio. Necesaria para que las URLs absolutas de Open Graph
  // y el canonical se generen bien — sin esto los previews sociales no cargan.
  // OJO: cambiar por el dominio propio en cuanto exista.
  site: "https://envero-marine.pabloambrosio91.workers.dev",

  output: "server",

  adapter: cloudflare({
    imageService: "passthrough",
  }),

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: false,
    },
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Space Grotesk",
      cssVariable: "--font-sans",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      fallbacks: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Playfair Display",
      cssVariable: "--font-display",
      weights: [500],
      styles: ["normal", "italic"],
      fallbacks: ["Times New Roman", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: [400, 500],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "SF Mono", "Consolas", "monospace"],
    },
  ],

  integrations: [react()],
});