import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type {
  AppQuestion,
  QuestionsResult,
  ReorderQuestionsRequest,
} from "../../types/question";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function reorderQuestions(
  quizId: string,
  input: ReorderQuestionsRequest,
  supabase: SupabaseServerClient,
): Promise<QuestionsResult> {
  const { data, error } = await supabase.rpc("reorder_quiz_questions", {
    p_quiz_id: quizId,
    p_items: input.items,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, questions: (data ?? []) as AppQuestion[] };
}
