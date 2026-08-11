import { hash } from "bcryptjs";
import type { UserRepository } from "../../../lib/db/ports/user-repository";
import type { CreateUserRequest, UserResult } from "../types/user";

export const BCRYPT_COST = 12;

export async function createUser(
  input: CreateUserRequest,
  users: UserRepository,
): Promise<UserResult> {
  try {
    const existing = await users.getByEmail(input.email);
    if (existing) return { ok: false, error: "email_taken" };

    const user = await users.create({
      email: input.email,
      name: input.name,
      role: input.role,
      password_hash: await hash(input.password, BCRYPT_COST),
    });

    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
