import { z } from "zod";

export const AppointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
]);

export const CreateAppointmentSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(1),
  company_name: z.string().optional(),
  appointment_date: z.string().min(1),
  status: AppointmentStatusSchema.optional(),
  notes: z.string().optional(),
});

export const UpdateAppointmentSchema = z
  .object({
    status: AppointmentStatusSchema.optional(),
    appointment_date: z.string().min(1).optional(),
    company_name: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.appointment_date !== undefined ||
      data.company_name !== undefined ||
      data.notes !== undefined,
    { message: "at least one field must be provided" },
  );

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;

export interface AppAppointment {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company_name: string | null;
  appointment_date: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentResult =
  | { ok: true; appointment: AppAppointment }
  | { ok: false; error: string };

export type AppointmentsResult =
  | { ok: true; appointments: AppAppointment[] }
  | { ok: false; error: string };
