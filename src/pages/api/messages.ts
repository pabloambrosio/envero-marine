import type { APIRoute } from "astro";
import { getRepositories } from "../../lib/db";
import { json, validateBody } from "../../lib/http";
import { createMessage } from "../../modules/message/services/create";
import { CreateMessageSchema } from "../../modules/message/types/message";

export const prerender = false;

// Endpoint público anónimo, mismo patrón que /api/appointments.
export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, CreateMessageSchema);
  if (!validated.ok) return validated.response;

  const result = await createMessage(validated.data, getRepositories().messages);

  return result.ok
    ? json({ message: result.message }, 201)
    : json({ error: result.error }, 400);
};
