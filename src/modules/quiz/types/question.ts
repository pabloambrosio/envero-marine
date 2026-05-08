import { z } from "zod";

export const CreateQuestionSchema = z.object({
  position: z.number().int().min(0),
  prompt: z.string().min(1),
  type: z.string().min(1).default("text"),
  config: z.unknown().optional(),
  required: z.boolean().default(true),
});

export const UpdateQuestionSchema = z
  .object({
    position: z.number().int().min(0).optional(),
    prompt: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    config: z.unknown().optional(),
    required: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.position !== undefined ||
      data.prompt !== undefined ||
      data.type !== undefined ||
      data.config !== undefined ||
      data.required !== undefined ||
      data.active !== undefined,
    { message: "at least one field must be provided" },
  );

export const ReorderQuestionsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.uuid(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type CreateQuestionRequest = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionRequest = z.infer<typeof UpdateQuestionSchema>;
export type ReorderQuestionsRequest = z.infer<typeof ReorderQuestionsSchema>;

export interface AppQuestion {
  id: string;
  quiz_id: string;
  position: number;
  prompt: string;
  type: string;
  config: unknown;
  required: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuestionResult =
  | { ok: true; question: AppQuestion }
  | { ok: false; error: string };

export type QuestionsResult =
  | { ok: true; questions: AppQuestion[] }
  | { ok: false; error: string };
