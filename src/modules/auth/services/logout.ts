import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { LogoutResult } from "../types/logout";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function logout(
  supabase: SupabaseServerClient,
): Promise<LogoutResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
