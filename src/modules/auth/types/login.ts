import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export interface LoginUser {
  id: string;
  email: string | null;
}

export type LoginResult =
  | { ok: true; user: LoginUser }
  | { ok: false; error: string };
