import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type {
  AppMessage,
  CreateMessageRequest,
  MessageResult,
} from "../types/message";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function createMessage(
  input: CreateMessageRequest,
  supabase: SupabaseServerClient,
): Promise<MessageResult> {
  const { data, error } = await supabase
    .from("message")
    .insert(input)
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, message: data as AppMessage };
}
