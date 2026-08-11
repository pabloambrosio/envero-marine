// @ts-check
import {
  defineConfig,
  envField,
  fontProviders,
  passthroughImageService,
} from "astro/config";
import node from "@astrojs/node";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // URL canónica del sitio. Necesaria para que las URLs absolutas de Open Graph
  // y el canonical se generen bien — sin esto los previews sociales no cargan.
  // OJO: cambiar por el dominio propio en cuanto exista.
  site: "https://envero-marine.pabloambrosio91.workers.dev",

  output: "server",

  // Servidor Node propio (HostGator Business corre Node vía cPanel). "standalone"
  // genera dist/server/entry.mjs, que levanta su propio HTTP server y sirve
  // también los estáticos de dist/client — no hace falta nginx/apache delante.
  adapter: node({
    mode: "standalone",
  }),

  // No usamos <Image> en ningún lado (las fotos son .webp estáticas en public/),
  // así que no hace falta optimización on-demand. Passthrough evita depender de
  // `sharp` en runtime — es un módulo nativo y el hosting compartido suele pelearse
  // con esos. Equivale al imageService: "passthrough" que traía el adapter anterior.
  image: {
    service: passthroughImageService(),
  },

  // Las claves de Supabase se declaran acá para que Astro las valide en el build
  // y las tipe. SUPABASE_SECRET_KEY es `secret`: NO se hornea en el bundle, se
  // lee de process.env en runtime (variables de entorno de la app en cPanel).
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({
        context: "server",
        access: "public",
      }),
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      SUPABASE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

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