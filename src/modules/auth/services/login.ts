import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { LoginRequest, LoginResult } from "../types/login";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function login(
  input: LoginRequest,
  supabase: SupabaseServerClient,
): Promise<LoginResult> {
  
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
    },
  };
}
