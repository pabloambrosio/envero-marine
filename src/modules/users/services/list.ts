import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppUser, UsersResult } from "../types/user";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function listUsers(
  supabase: SupabaseServerClient,
): Promise<UsersResult> {
  const { data, error } = await supabase
    .from("app_user")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, users: (data ?? []) as AppUser[] };
}
