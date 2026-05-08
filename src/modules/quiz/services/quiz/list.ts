import type { createSupabaseServerClient } from "../../../../lib/supabase/server";
import type { AppQuiz, QuizzesResult } from "../../types/quiz";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function listQuizzes(
  supabase: SupabaseServerClient,
): Promise<QuizzesResult> {
  const { data, error } = await supabase
    .from("quiz")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, quizzes: (data ?? []) as AppQuiz[] };
}
