import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuiz, CreateQuizRequest, QuizResult } from "../../types/quiz";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function createQuiz(
  input: CreateQuizRequest,
  supabase: SupabaseServerClient,
): Promise<QuizResult> {
  const { data, error } = await supabase
    .from("quiz")
    .insert(input)
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, quiz: data as AppQuiz };
}
