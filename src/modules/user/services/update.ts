import { hash } from "bcryptjs";
import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { UpdateUserRequest, UserResult } from "../types/user";
import { BCRYPT_COST } from "./create";

export async function updateUser(
  id: string,
  input: UpdateUserRequest,
  actorId: string,
  users: UserRepository,
): Promise<UserResult> {
  try {
    // Anti-lockout: el admin no puede desactivarse ni sacarse el rol a sí
    // mismo. Como la baja es solo `active = false`, esto garantiza que
    // siempre quede al menos un admin activo.
    if (id === actorId && (input.active === false || input.role === "staff")) {
      return { ok: false, error: "cannot_modify_self" };
    }

    if (input.email !== undefined) {
      const existing = await users.getByEmail(input.email);
      if (existing && existing.id !== id) {
        return { ok: false, error: "email_taken" };
      }
    }

    const { password, ...patch } = input;
    const user = await users.update(id, {
      ...patch,
      ...(password !== undefined
        ? { password_hash: await hash(password, BCRYPT_COST) }
        : {}),
    });
    if (!user) return { ok: false, error: "not_found" };

    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
