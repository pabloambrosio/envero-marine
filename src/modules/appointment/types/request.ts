import { z } from "zod";
import { isValidSlot } from "../lib/slot";
import type { AppAppointment } from "./appointment";

// Payload del flujo público anónimo. Más restrictivo que el del admin:
//   * El visitante nunca manda `status`. La RLS lo rechaza igual
//     (`appointment_anon_insert` exige `status = 'pending'`), pero el schema
//     lo bloquea acá para devolver un 400 limpio en lugar de un error
//     críptico de Postgres.
//   * `name`/`email`/`phone`/`company_name` van directo en `appointment` —
//     no hay tabla `client` separada.
//   * `appointment_date` se valida con la misma regla de slot que definía
//     la DB antes (lunes-viernes, 08:00-17:00 en `America/Merida`, hora en
//     punto) — hoy es solo validación de request/front, no hay CHECK en DB.

export const RequestAppointmentSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(1),
  company_name: z.string().optional(),
  appointment_date: z
    .string()
    .min(1)
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: "invalid datetime",
    })
    .refine((s) => isValidSlot(new Date(s)).ok, {
      message:
        "invalid_slot — must be Mon–Fri 08:00–17:00 (America/Merida) on the hour",
    }),
  notes: z.string().optional(),
});

export type RequestAppointmentRequest = z.infer<
  typeof RequestAppointmentSchema
>;

export type RequestAppointmentResult =
  | { ok: true; appointment: AppAppointment }
  | { ok: false; error: string };
