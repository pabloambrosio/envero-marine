import { defineMiddleware } from "astro:middleware";
import { json } from "./lib/http";
import { createSupabaseServerClient } from "./lib/supabase/server";

const PROTECTED_PREFIXES = [
  "/admin",
  "/api/admin",
  "/vendors",
  "/api/vendors",
];

const PUBLIC_EXCEPTIONS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
  "/vendors/login",
  "/api/vendors/login",
  "/api/vendors/logout",
]);

function isProtected(pathname: string): boolean {
  if (PUBLIC_EXCEPTIONS.has(pathname)) return false;
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function loginUrlFor(pathname: string): string {
  return pathname.startsWith("/vendors") ? "/vendors/login" : "/admin/login";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (!isProtected(pathname)) {
    return next();
  }

  const supabase = createSupabaseServerClient({
    request: context.request,
    cookies: context.cookies,
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (pathname.startsWith("/api/")) {
      return json({ error: "unauthorized" }, 401);
    }
    return context.redirect(loginUrlFor(pathname));
  }

  context.locals.user = user;
  return next();
});
