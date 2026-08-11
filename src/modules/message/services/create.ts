import type { MessageRepository } from "../../../lib/db/ports/message-repository";
import type { CreateMessageRequest, MessageResult } from "../types/message";

export async function createMessage(
  input: CreateMessageRequest,
  messages: MessageRepository,
): Promise<MessageResult> {
  try {
    const message = await messages.create(input);
    return { ok: true, message };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
