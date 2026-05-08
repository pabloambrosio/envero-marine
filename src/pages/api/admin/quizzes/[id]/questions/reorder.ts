import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../../../lib/http";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { reorderQuestions } from "../../../../../../modules/quiz/services/question/reorder";
import { ReorderQuestionsSchema } from "../../../../../../modules/quiz/types/question";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, ReorderQuestionsSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await reorderQuestions(params.id!, validated.data, supabase);

  return result.ok
    ? json({ questions: result.questions })
    : json({ error: result.error }, 400);
};
