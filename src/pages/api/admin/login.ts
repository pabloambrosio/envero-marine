import type { APIRoute } from "astro";
import { getRepositories } from "../../../lib/db";
import { json, validateBody } from "../../../lib/http";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../lib/session";
import { login } from "../../../modules/auth/services/login";
import { LoginSchema } from "../../../modules/auth/types/login";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, LoginSchema);
  if (!validated.ok) return validated.response;

  const result = await login(validated.data, getRepositories().auth);

  if (!result.ok) {
    return json({ error: result.error }, 401);
  }

  cookies.set(
    SESSION_COOKIE,
    result.sessionToken,
    sessionCookieOptions(result.expiresAt),
  );
  return json({ user: result.user });
};
