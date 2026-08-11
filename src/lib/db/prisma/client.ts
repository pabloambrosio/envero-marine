import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { DATABASE_URL } from "astro:env/server";
import { PrismaClient } from "../../../generated/prisma/client";

// Singleton por proceso. A diferencia del cliente SSR de Supabase (que era
// per-request por los cookie handlers), acá no hay estado de sesión en el
// cliente — las sesiones viven en la tabla `session` — así que compartir el
// pool entre requests es lo correcto.
//
// DATABASE_URL viene de astro:env/server con access "secret": se resuelve
// contra process.env en runtime, nunca se hornea en el bundle.
let prisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({ adapter: new PrismaMariaDb(DATABASE_URL) });
  }
  return prisma;
}
