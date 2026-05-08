import type { APIRoute } from "astro";
import { json } from "../../../lib/http";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { logout } from "../../../modules/auth/services/logout";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await logout(supabase);

  return result.ok
    ? json({ ok: true })
    : json({ error: result.error }, 500);
};
