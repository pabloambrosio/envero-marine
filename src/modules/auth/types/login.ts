import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export interface LoginUser {
  id: string;
  email: string;
}

// sessionToken/expiresAt los consume solo el endpoint para armar la cookie —
// al browser viaja únicamente `user`.
export type LoginResult =
  | { ok: true; user: LoginUser; sessionToken: string; expiresAt: Date }
  | { ok: false; error: string };
