import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getUser } from "../../../../modules/users/services/get";
import { updateUser } from "../../../../modules/users/services/update";
import { deactivateUser } from "../../../../modules/users/services/deactivate";
import { UpdateUserSchema } from "../../../../modules/users/types/user";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await getUser(params.id!, supabase);

  if (result.ok) return json({ user: result.user });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, UpdateUserSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await updateUser(params.id!, validated.data, supabase);

  if (result.ok) return json({ user: result.user });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await deactivateUser(params.id!, supabase);

  if (result.ok) return json({ user: result.user });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};
