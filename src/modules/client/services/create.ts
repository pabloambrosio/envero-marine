import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type {
  AppClient,
  ClientResult,
  CreateClientRequest,
} from "../types/client";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function createClient(
  input: CreateClientRequest,
  supabase: SupabaseServerClient,
): Promise<ClientResult> {
  const { data, error } = await supabase
    .from("client")
    .insert(input)
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, client: data as AppClient };
}
