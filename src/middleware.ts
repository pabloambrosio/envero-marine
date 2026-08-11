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

// La gestión de usuarios es la única sección con rol: solo admin. El resto
// del panel es para cualquier usuario logueado.
const ADMIN_ONLY_PREFIXES = ["/admin/users", "/api/admin/users"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isProtected(pathname: string): boolean {
  if (PUBLIC_EXCEPTIONS.has(pathname)) return false;
  return matchesPrefix(pathname, PROTECTED_PREFIXES);
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

  if (
    matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) &&
    session.user.role !== "admin"
  ) {
    if (pathname.startsWith("/api/")) {
      return json({ error: "forbidden" }, 403);
    }
    return context.redirect("/admin");
  }

  context.locals.user = session.user;
  return next();
});
