import { defineConfig, env } from "prisma/config";

// Prisma 7 no carga .env solo (a diferencia del 6). Node 22 trae
// loadEnvFile nativo; en prod (cPanel) las vars vienen del entorno y el
// archivo puede no existir — por eso el try vacío.
try {
  process.loadEnvFile(".env");
} catch {
  // sin .env: las vars ya están en el entorno
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
