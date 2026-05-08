import { z } from "zod";

export const AppointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const CreateAppointmentSchema = z.object({
  client_id: z.uuid(),
  vendor_id: z.uuid().optional(),
  quiz_id: z.uuid().optional(),
  quiz_snapshot: z.unknown(),
  appointment_date: z.string().min(1),
  status: AppointmentStatusSchema.optional(),
  notes: z.string().optional(),
});

export const UpdateAppointmentSchema = z
  .object({
    status: AppointmentStatusSchema.optional(),
    vendor_id: z.uuid().nullable().optional(),
    appointment_date: z.string().min(1).optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.vendor_id !== undefined ||
      data.appointment_date !== undefined ||
      data.notes !== undefined,
    { message: "at least one field must be provided" },
  );

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;

export interface AppAppointment {
  id: string;
  client_id: string;
  vendor_id: string | null;
  quiz_id: string | null;
  quiz_snapshot: unknown;
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
