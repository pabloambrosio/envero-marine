import { z } from "zod";
import type { AppMessage } from "../../../lib/db/ports/message-repository";

// El tipo de dominio vive en el puerto; acá queda el schema Zod del request.
export type { AppMessage } from "../../../lib/db/ports/message-repository";

export const CreateMessageSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  message: z.string().min(1),
});

export type CreateMessageRequest = z.infer<typeof CreateMessageSchema>;

export type MessageResult =
  | { ok: true; message: AppMessage }
  | { ok: false; error: string };
