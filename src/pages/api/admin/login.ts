import type { APIRoute } from "astro";
import { json, validateBody } from "../../../lib/http";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { login } from "../../../modules/auth/services/login";
import { LoginSchema } from "../../../modules/auth/types/login";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, LoginSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await login(validated.data, supabase);

  return result.ok
    ? json({ user: result.user })
    : json({ error: result.error }, 401);
};
