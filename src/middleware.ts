import { defineMiddleware } from "astro:middleware";
import { getRepositories } from "./lib/db";
import { json } from "./lib/http";
import { SESSION_COOKIE, hashSessionToken } from "./lib/session";

const PROTECTED_PREFIXES = ["/admin", "/api/admin"];

const PUBLIC_EXCEPTIONS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

function isProtected(pathname: string): boolean {
  if (PUBLIC_EXCEPTIONS.has(pathname)) return false;
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (!isProtected(pathname)) {
    return next();
  }

  // Antes esto era supabase.auth.getUser() — un network call de 50-150ms.
  // Ahora es una query local a `session` con el hash del token de la cookie.
  const sessionToken = context.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionToken
    ? await getRepositories().auth.getSessionWithUser(
        hashSessionToken(sessionToken),
      )
    : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return json({ error: "unauthorized" }, 401);
    }
    return context.redirect("/admin/login");
  }

  context.locals.user = session.user;
  return next();
});
