import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { listQuizzes } from "../../../../modules/quiz/services/quiz/list";
import { createQuiz } from "../../../../modules/quiz/services/quiz/create";
import { CreateQuizSchema } from "../../../../modules/quiz/types/quiz";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await listQuizzes(supabase);

  return result.ok
    ? json({ quizzes: result.quizzes })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, CreateQuizSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await createQuiz(validated.data, supabase);

  return result.ok
    ? json({ quiz: result.quiz }, 201)
    : json({ error: result.error }, 400);
};
