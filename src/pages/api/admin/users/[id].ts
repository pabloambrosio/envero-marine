import type { APIRoute } from "astro";
import { getRepositories } from "../../../../lib/db";
import { json, validateBody } from "../../../../lib/http";
import { getUser } from "../../../../modules/user/services/get";
import { updateUser } from "../../../../modules/user/services/update";
import { UpdateUserSchema } from "../../../../modules/user/types/user";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const result = await getUser(params.id!, getRepositories().users);

  if (result.ok) return json({ user: result.user });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const validated = await validateBody(request, UpdateUserSchema);
  if (!validated.ok) return validated.response;

  const result = await updateUser(
    params.id!,
    validated.data,
    locals.user!.id,
    getRepositories().users,
  );

  if (result.ok) return json({ user: result.user });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  if (result.error === "email_taken") return json({ error: "email_taken" }, 409);
  if (result.error === "cannot_modify_self") {
    return json({ error: "cannot_modify_self" }, 409);
  }
  return json({ error: result.error }, 400);
};
