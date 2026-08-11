import { z } from "zod";
import type { AppUser } from "../../../lib/db/ports/user-repository";

// Los tipos de dominio viven en el puerto (src/lib/db/ports); acá quedan los
// schemas Zod de validación de requests y se re-exporta el dominio para que
// el resto del código siga importando desde el módulo.
export type { AppUser, UserRole } from "../../../lib/db/ports/user-repository";

export const UserRoleSchema = z.enum(["admin", "staff"]);

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  password: z.string().min(8),
});

export const UpdateUserSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
    role: UserRoleSchema.optional(),
    active: z.boolean().optional(),
    // Reset manual: no hay recuperación por email, la password nueva la
    // define el admin y la comunica por fuera.
    password: z.string().min(8).optional(),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.name !== undefined ||
      data.role !== undefined ||
      data.active !== undefined ||
      data.password !== undefined,
    { message: "at least one field must be provided" },
  );

export const UpdateProfileSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: "at least one field must be provided",
  });

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;

export type UserResult =
  | { ok: true; user: AppUser }
  | { ok: false; error: string };

export type UsersResult =
  | { ok: true; users: AppUser[] }
  | { ok: false; error: string };

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };
