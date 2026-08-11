import { compare, hash } from "bcryptjs";
import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { ChangePasswordRequest, ChangePasswordResult } from "../types/user";
import { BCRYPT_COST } from "./create";

export async function changePassword(
  userId: string,
  input: ChangePasswordRequest,
  users: UserRepository,
): Promise<ChangePasswordResult> {
  try {
    const currentHash = await users.getPasswordHash(userId);
    if (!currentHash) return { ok: false, error: "not_found" };

    const valid = await compare(input.current_password, currentHash);
    if (!valid) return { ok: false, error: "invalid_password" };

    await users.update(userId, {
      password_hash: await hash(input.new_password, BCRYPT_COST),
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
