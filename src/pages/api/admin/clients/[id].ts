import type { APIRoute } from "astro";
import { json } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getClient } from "../../../../modules/client/services/get";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await getClient(params.id!, supabase);

  if (result.ok) return json({ client: result.client });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};
