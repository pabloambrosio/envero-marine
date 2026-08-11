import type { PrismaClient } from "../../../generated/prisma/client";
import type { MessageRepository, NewMessage } from "../ports/message-repository";
import { toAppMessage } from "./mappers";

export function createPrismaMessageRepository(
  prisma: PrismaClient,
): MessageRepository {
  return {
    async create(input: NewMessage) {
      const row = await prisma.message.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          companyName: input.company_name ?? null,
          message: input.message,
        },
      });
      return toAppMessage(row);
    },
  };
}
