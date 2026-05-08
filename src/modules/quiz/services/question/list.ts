import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuestion, QuestionsResult } from "../../types/question";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function listQuestions(
  quizId: string,
  supabase: SupabaseServerClient,
): Promise<QuestionsResult> {
  const { data, error } = await supabase
    .from("quiz_question")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, questions: (data ?? []) as AppQuestion[] };
}
