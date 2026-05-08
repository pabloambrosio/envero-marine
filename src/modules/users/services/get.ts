import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppUser, UserResult } from "../types/user";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getUser(
  id: string,
  supabase: SupabaseServerClient,
): Promise<UserResult> {
  const { data, error } = await supabase
    .from("app_user")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, user: data as AppUser };
}
