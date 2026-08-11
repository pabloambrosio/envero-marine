import type { APIRoute } from "astro";
import { getRepositories } from "../../../lib/db";
import { json } from "../../../lib/http";
import { SESSION_COOKIE } from "../../../lib/session";
import { logout } from "../../../modules/auth/services/logout";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const sessionToken = cookies.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    const result = await logout(sessionToken, getRepositories().auth);
    if (!result.ok) return json({ error: result.error }, 500);
  }

  cookies.delete(SESSION_COOKIE, { path: "/" });
  return json({ ok: true });
};
