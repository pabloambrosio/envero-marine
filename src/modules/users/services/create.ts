import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import type { AppUser, CreateUserRequest, UserResult } from "../types/user";

export async function createUser(
  input: CreateUserRequest,
): Promise<UserResult> {
  const admin = createSupabaseAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? "auth_create_failed" };
  }

  const { data, error } = await admin
    .from("app_user")
    .insert({
      id: authData.user.id,
      name: input.name,
      email: input.email,
      role: input.role,
    })
    .select()
    .single();

  if (error) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: error.message };
  }

  return { ok: true, user: data as AppUser };
}
