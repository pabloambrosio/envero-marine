import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { UpdateProfileRequest, UserResult } from "../types/user";

export async function updateProfile(
  userId: string,
  input: UpdateProfileRequest,
  users: UserRepository,
): Promise<UserResult> {
  try {
    if (input.email !== undefined) {
      const existing = await users.getByEmail(input.email);
      if (existing && existing.id !== userId) {
        return { ok: false, error: "email_taken" };
      }
    }

    const user = await users.update(userId, input);
    if (!user) return { ok: false, error: "not_found" };

    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
