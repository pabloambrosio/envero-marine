import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { UsersResult } from "../types/user";

export async function listUsers(users: UserRepository): Promise<UsersResult> {
  try {
    const all = await users.list();
    return { ok: true, users: all };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
