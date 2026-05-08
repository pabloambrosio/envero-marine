import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuiz, QuizResult } from "../../types/quiz";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function deactivateQuiz(
  id: string,
  supabase: SupabaseServerClient,
): Promise<QuizResult> {
  const { data, error } = await supabase
    .from("quiz")
    .update({ active: false })
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
