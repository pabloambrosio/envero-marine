import { z } from "zod";

// Closed enum: mirrors the public.question_type type in Postgres.
export const QuestionTypeSchema = z.enum([
  "single_choice",
  "multiple_choice",
  "open_text",
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// Cross-field validation shared by Create and Update. Mirrors the
// quiz_question_type_options_check CHECK in the database. Skipped when `type`
// is absent (partial Update that doesn't touch type) — Zod can't know the
// stored type without a database round-trip, so the BD constraint is the last
// line of defense in that case.
function applyTypeRules(
  data: {
    type?: QuestionType;
    options?: string[];
    allow_other?: boolean;
  },
  ctx: z.RefinementCtx,
): void {
  const { type, options, allow_other } = data;
  if (type === undefined) return;

  if (type === "single_choice" || type === "multiple_choice") {
    if (!options || options.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "must provide at least 2 options",
      });
    }
  } else if (type === "open_text") {
    if (options && options.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "open_text questions cannot have options",
      });
    }
    if (allow_other === false) {
      ctx.addIssue({
        code: "custom",
        path: ["allow_other"],
        message: "open_text questions must have allow_other = true",
      });
    }
  }
}

export const CreateQuestionSchema = z
  .object({
    position: z.number().int().min(0),
    prompt: z.string().min(1),
    type: QuestionTypeSchema,
    options: z.array(z.string().min(1)).default([]),
    allow_other: z.boolean().default(true),
    required: z.boolean().default(true),
  })
  .superRefine(applyTypeRules);

export const UpdateQuestionSchema = z
  .object({
    position: z.number().int().min(0).optional(),
    prompt: z.string().min(1).optional(),
    type: QuestionTypeSchema.optional(),
    options: z.array(z.string().min(1)).optional(),
    allow_other: z.boolean().optional(),
    required: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.position !== undefined ||
      data.prompt !== undefined ||
      data.type !== undefined ||
      data.options !== undefined ||
      data.allow_other !== undefined ||
      data.required !== undefined ||
      data.active !== undefined,
    { message: "at least one field must be provided" },
  )
  .superRefine(applyTypeRules);

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
  type: QuestionType;
  options: string[];
  allow_other: boolean;
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
