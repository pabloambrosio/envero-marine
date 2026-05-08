import { z } from "zod";

export const CreateQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateQuizSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.active !== undefined,
    { message: "at least one field must be provided" },
  );

export type CreateQuizRequest = z.infer<typeof CreateQuizSchema>;
export type UpdateQuizRequest = z.infer<typeof UpdateQuizSchema>;

export interface AppQuiz {
  id: string;
  title: string;
  description: string | null;
  version: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuizResult =
  | { ok: true; quiz: AppQuiz }
  | { ok: false; error: string };

export type QuizzesResult =
  | { ok: true; quizzes: AppQuiz[] }
  | { ok: false; error: string };
