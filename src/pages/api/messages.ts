import type { APIRoute } from "astro";
import { json, validateBody } from "../../lib/http";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createMessage } from "../../modules/message/services/create";
import { CreateMessageSchema } from "../../modules/message/types/message";

export const prerender = false;

// Endpoint público anónimo, mismo patrón que /api/appointments: service-role
// porque el `INSERT ... RETURNING *` de supabase-js pasa por RLS también en
// el SELECT implícito, y anon no tiene SELECT sobre `message`.
export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, CreateMessageSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseAdminClient();
  const result = await createMessage(validated.data, supabase);

  return result.ok
    ? json({ message: result.message }, 201)
    : json({ error: result.error }, 400);
};
