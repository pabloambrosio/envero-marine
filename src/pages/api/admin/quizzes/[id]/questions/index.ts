import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../../../lib/http";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { listQuestions } from "../../../../../../modules/quiz/services/question/list";
import { createQuestion } from "../../../../../../modules/quiz/services/question/create";
import { CreateQuestionSchema } from "../../../../../../modules/quiz/types/question";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await listQuestions(params.id!, supabase);

  return result.ok
    ? json({ questions: result.questions })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, CreateQuestionSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await createQuestion(params.id!, validated.data, supabase);

  return result.ok
    ? json({ question: result.question }, 201)
    : json({ error: result.error }, 400);
};
