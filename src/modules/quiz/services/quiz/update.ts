import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuiz, QuizResult, UpdateQuizRequest } from "../../types/quiz";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function updateQuiz(
  id: string,
  input: UpdateQuizRequest,
  supabase: SupabaseServerClient,
): Promise<QuizResult> {
  const { data, error } = await supabase
    .from("quiz")
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, quiz: data as AppQuiz };
}
