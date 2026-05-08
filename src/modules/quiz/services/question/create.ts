import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type {
  AppQuestion,
  CreateQuestionRequest,
  QuestionResult,
} from "../../types/question";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function createQuestion(
  quizId: string,
  input: CreateQuestionRequest,
  supabase: SupabaseServerClient,
): Promise<QuestionResult> {
  const { data, error } = await supabase
    .from("quiz_question")
    .insert({ ...input, quiz_id: quizId })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, question: data as AppQuestion };
}
