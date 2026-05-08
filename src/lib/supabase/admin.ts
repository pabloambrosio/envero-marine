import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const secretKey = import.meta.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars",
  );
}

// Server-only client. Bypasses RLS via service-role; never import in browser code.
export function createSupabaseAdminClient() {
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
