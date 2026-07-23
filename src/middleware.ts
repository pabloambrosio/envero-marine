import { defineMiddleware } from "astro:middleware";
import { json } from "./lib/http";
import { createSupabaseServerClient } from "./lib/supabase/server";

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
    return context.redirect("/admin/login");
  }

  context.locals.user = user;
  return next();
});
