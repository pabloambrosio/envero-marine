import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "vendor"]);

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: UserRoleSchema,
});

export const UpdateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: UserRoleSchema.optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.role !== undefined ||
      data.active !== undefined,
    { message: "at least one field must be provided" },
  );

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendor";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserResult =
  | { ok: true; user: AppUser }
  | { ok: false; error: string };

export type UsersResult =
  | { ok: true; users: AppUser[] }
  | { ok: false; error: string };
