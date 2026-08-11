import type { APIRoute } from "astro";
import { getRepositories } from "../../../../lib/db";
import { json, validateBody } from "../../../../lib/http";
import { createUser } from "../../../../modules/user/services/create";
import { listUsers } from "../../../../modules/user/services/list";
import { CreateUserSchema } from "../../../../modules/user/types/user";

export const prerender = false;

export const GET: APIRoute = async () => {
  const result = await listUsers(getRepositories().users);

  return result.ok
    ? json({ users: result.users })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, CreateUserSchema);
  if (!validated.ok) return validated.response;

  const result = await createUser(validated.data, getRepositories().users);

  if (result.ok) return json({ user: result.user }, 201);
  if (result.error === "email_taken") return json({ error: "email_taken" }, 409);
  return json({ error: result.error }, 400);
};
