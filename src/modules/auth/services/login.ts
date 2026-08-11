import { compare } from "bcryptjs";
import type { AuthRepository } from "../../../lib/db/ports/auth-repository";
import {
  SESSION_TTL_MS,
  generateSessionToken,
  hashSessionToken,
} from "../../../lib/session";
import type { LoginRequest, LoginResult } from "../types/login";

export async function login(
  input: LoginRequest,
  auth: AuthRepository,
): Promise<LoginResult> {
  try {
    const user = await auth.findUserByEmail(input.email);

    // Mismo error para "no existe", "inactivo" y "password mal": no filtrar
    // cuáles emails tienen cuenta.
    if (!user || !user.active) {
      return { ok: false, error: "invalid_credentials" };
    }

    const validPassword = await compare(input.password, user.password_hash);
    if (!validPassword) {
      return { ok: false, error: "invalid_credentials" };
    }

    // Limpieza oportunista: las sesiones vencidas del usuario se van en cada
    // login. Sin cron.
    await auth.deleteExpiredSessions(user.id);

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await auth.createSession({
      id: hashSessionToken(sessionToken),
      user_id: user.id,
      expires_at: expiresAt,
    });

    return {
      ok: true,
      user: { id: user.id, email: user.email },
      sessionToken,
      expiresAt,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
