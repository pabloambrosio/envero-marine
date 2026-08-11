// Sesiones opacas: token aleatorio en la cookie, SHA-256 del token como id
// en la tabla `session`. El token en claro nunca toca la DB — un dump no
// regala sesiones activas.

import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    // En dev servimos por http; una cookie Secure ahí no llega nunca.
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
