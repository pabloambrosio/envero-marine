import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../../lib/http";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import { getQuiz } from "../../../../../modules/quiz/services/quiz/get";
import { updateQuiz } from "../../../../../modules/quiz/services/quiz/update";
import { deactivateQuiz } from "../../../../../modules/quiz/services/quiz/deactivate";
import { UpdateQuizSchema } from "../../../../../modules/quiz/types/quiz";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await getQuiz(params.id!, supabase);

  if (result.ok) return json({ quiz: result.quiz });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, UpdateQuizSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await updateQuiz(params.id!, validated.data, supabase);

  if (result.ok) return json({ quiz: result.quiz });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await deactivateQuiz(params.id!, supabase);

  if (result.ok) return json({ quiz: result.quiz });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};
