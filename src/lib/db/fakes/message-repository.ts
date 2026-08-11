import { randomUUID } from "node:crypto";
import type {
  AppMessage,
  MessageRepository,
  NewMessage,
} from "../ports/message-repository";

export interface FakeMessageRepository extends MessageRepository {
  rows: Map<string, AppMessage>;
}

export function createFakeMessageRepository(): FakeMessageRepository {
  const rows = new Map<string, AppMessage>();

  return {
    rows,

    async create(input: NewMessage) {
      const message: AppMessage = {
        id: randomUUID(),
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        company_name: input.company_name ?? null,
        message: input.message,
        created_at: new Date().toISOString(),
      };
      rows.set(message.id, message);
      return message;
    },
  };
}
