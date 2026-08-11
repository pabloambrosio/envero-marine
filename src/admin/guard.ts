import type { AstroGlobal } from "astro";
import type { UserRole } from "../lib/db/ports/user-repository";

export interface AdminContext {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
}

export type GuardResult =
  | { ok: true; admin: AdminContext }
  | { ok: false; redirect: Response };

export async function requireAdmin(Astro: AstroGlobal): Promise<GuardResult> {
  const user = Astro.locals.user;
  if (!user) {
    return { ok: false, redirect: Astro.redirect("/admin/login") };
  }

  return {
    ok: true,
    admin: {
      id: user.id,
      email: user.email ?? null,
      name: user.name,
      role: user.role,
    },
  };
}
