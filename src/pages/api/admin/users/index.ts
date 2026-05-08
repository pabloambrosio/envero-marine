import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { listUsers } from "../../../../modules/users/services/list";
import { createUser } from "../../../../modules/users/services/create";
import { CreateUserSchema } from "../../../../modules/users/types/user";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await listUsers(supabase);

  return result.ok
    ? json({ users: result.users })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, CreateUserSchema);
  if (!validated.ok) return validated.response;

  const result = await createUser(validated.data);

  return result.ok
    ? json({ user: result.user }, 201)
    : json({ error: result.error }, 400);
};
