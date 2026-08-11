import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { UserResult } from "../types/user";

export async function getUser(
  id: string,
  users: UserRepository,
): Promise<UserResult> {
  try {
    const user = await users.getById(id);
    if (!user) return { ok: false, error: "not_found" };
    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
