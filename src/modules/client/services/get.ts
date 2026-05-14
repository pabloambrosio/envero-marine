import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppClient, ClientResult } from "../types/client";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getClient(
  id: string,
  supabase: SupabaseServerClient,
): Promise<ClientResult> {
  const { data, error } = await supabase
    .from("client")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, client: data as AppClient };
}
