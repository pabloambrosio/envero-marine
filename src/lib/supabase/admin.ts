import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  SUPABASE_SECRET_KEY,
} from "astro:env/server";

// Server-only client. Bypasses RLS via service-role; never import in browser code.
// SUPABASE_SECRET_KEY llega de astro:env/server con access "secret": se resuelve
// contra process.env en runtime, así que la clave nunca queda escrita en dist/.
export function createSupabaseAdminClient() {
  return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
