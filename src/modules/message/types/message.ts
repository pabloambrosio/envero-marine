import { z } from "zod";

export const CreateMessageSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  message: z.string().min(1),
});

export type CreateMessageRequest = z.infer<typeof CreateMessageSchema>;

export interface AppMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string;
  created_at: string;
}

export type MessageResult =
  | { ok: true; message: AppMessage }
  | { ok: false; error: string };
