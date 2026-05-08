import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuestion, QuestionResult } from "../../types/question";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getQuestion(
  quizId: string,
  questionId: string,
  supabase: SupabaseServerClient,
): Promise<QuestionResult> {
  const { data, error } = await supabase
    .from("quiz_question")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("id", questionId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, question: data as AppQuestion };
}
