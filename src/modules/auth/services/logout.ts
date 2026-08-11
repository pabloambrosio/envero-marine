import type { AuthRepository } from "../../../lib/db/ports/auth-repository";
import { hashSessionToken } from "../../../lib/session";
import type { LogoutResult } from "../types/logout";

export async function logout(
  sessionToken: string,
  auth: AuthRepository,
): Promise<LogoutResult> {
  try {
    await auth.deleteSession(hashSessionToken(sessionToken));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
