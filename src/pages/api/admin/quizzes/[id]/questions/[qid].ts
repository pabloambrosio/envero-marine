import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../../../lib/http";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { getQuestion } from "../../../../../../modules/quiz/services/question/get";
import { updateQuestion } from "../../../../../../modules/quiz/services/question/update";
import { deactivateQuestion } from "../../../../../../modules/quiz/services/question/deactivate";
import { UpdateQuestionSchema } from "../../../../../../modules/quiz/types/question";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await getQuestion(params.id!, params.qid!, supabase);

  if (result.ok) return json({ question: result.question });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, UpdateQuestionSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await updateQuestion(
    params.id!,
    params.qid!,
    validated.data,
    supabase,
  );

  if (result.ok) return json({ question: result.question });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await deactivateQuestion(params.id!, params.qid!, supabase);

  if (result.ok) return json({ question: result.question });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};
