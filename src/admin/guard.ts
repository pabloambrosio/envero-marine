import type { AstroGlobal } from "astro";
import { createSupabaseServerClient } from "../lib/supabase/server";

export interface AdminContext {
  id: string;
  email: string | null;
  name: string;
}

export type GuardResult =
  | { ok: true; admin: AdminContext }
  | { ok: false; redirect: Response };

export async function requireAdmin(Astro: AstroGlobal): Promise<GuardResult> {
  const user = Astro.locals.user;
  if (!user) {
    return { ok: false, redirect: Astro.redirect("/admin/login") };
  }

  const supabase = createSupabaseServerClient({
    request: Astro.request,
    cookies: Astro.cookies,
  });

  const { data: appUser } = await supabase
    .from("app_user")
    .select("role, active, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!appUser || appUser.role !== "admin" || !appUser.active) {
    await supabase.auth.signOut();
    return {
      ok: false,
      redirect: Astro.redirect("/admin/login?reason=forbidden"),
    };
  }

  return {
    ok: true,
    admin: {
      id: user.id,
      email: user.email ?? null,
      name: appUser.name ?? user.email ?? "admin",
    },
  };
}
