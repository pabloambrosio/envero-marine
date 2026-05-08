import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type {
  AppQuestion,
  QuestionResult,
  UpdateQuestionRequest,
} from "../../types/question";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function updateQuestion(
  quizId: string,
  questionId: string,
  input: UpdateQuestionRequest,
  supabase: SupabaseServerClient,
): Promise<QuestionResult> {
  const { data, error } = await supabase
    .from("quiz_question")
    .update(input)
    .eq("quiz_id", quizId)
    .eq("id", questionId)
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, question: data as AppQuestion };
}
