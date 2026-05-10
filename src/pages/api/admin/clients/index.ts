import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createClient } from "../../../../modules/client/services/create";
import { CreateClientSchema } from "../../../../modules/client/types/client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, CreateClientSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await createClient(validated.data, supabase);

  return result.ok
    ? json({ client: result.client }, 201)
    : json({ error: result.error }, 400);
};
