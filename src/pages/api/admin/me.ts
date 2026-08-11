// Perfil del usuario logueado. A diferencia de /api/admin/users/*, acá no
// hay chequeo de rol: cualquier usuario del panel puede ver y editar lo suyo.

import type { APIRoute } from "astro";
import { z } from "zod";
import { getRepositories } from "../../../lib/db";
import { json, validateBody } from "../../../lib/http";
import { changePassword } from "../../../modules/user/services/change-password";
import { getUser } from "../../../modules/user/services/get";
import { updateProfile } from "../../../modules/user/services/update-profile";
import {
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "../../../modules/user/types/user";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const result = await getUser(locals.user!.id, getRepositories().users);

  return result.ok
    ? json({ user: result.user })
    : json({ error: result.error }, 500);
};

// Un solo PATCH para las dos operaciones del perfil: datos personales o
// cambio de password, discriminadas por la forma del body.
const MeSchema = z.union([
  z.object({ profile: UpdateProfileSchema }),
  z.object({ password: ChangePasswordSchema }),
]);

export const PATCH: APIRoute = async ({ request, locals }) => {
  const validated = await validateBody(request, MeSchema);
  if (!validated.ok) return validated.response;

  const users = getRepositories().users;
  const userId = locals.user!.id;

  if ("profile" in validated.data) {
    const result = await updateProfile(userId, validated.data.profile, users);
    if (result.ok) return json({ user: result.user });
    if (result.error === "email_taken") {
      return json({ error: "email_taken" }, 409);
    }
    return json({ error: result.error }, 400);
  }

  const result = await changePassword(userId, validated.data.password, users);
  if (result.ok) return json({ ok: true });
  if (result.error === "invalid_password") {
    return json({ error: "invalid_password" }, 403);
  }
  return json({ error: result.error }, 400);
};
