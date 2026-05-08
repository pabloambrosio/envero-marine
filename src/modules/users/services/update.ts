import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppUser, UpdateUserRequest, UserResult } from "../types/user";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function updateUser(
  id: string,
  input: UpdateUserRequest,
  supabase: SupabaseServerClient,
): Promise<UserResult> {
  const { data, error } = await supabase
    .from("app_user")
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, user: data as AppUser };
}
