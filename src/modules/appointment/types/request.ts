import { z } from "zod";
import type { AppClient } from "../../client/types/client";
import { isValidSlot } from "../lib/slot";
import type { AppAppointment } from "./appointment";

// Payload del flujo público anónimo. Más restrictivo que el del admin:
//   * El visitante nunca manda `vendor_id` ni `status`. La RLS los rechaza
//     igual (`appointment_anon_insert` exige `vendor_id is null and status =
//     'pending'`), pero el schema los bloquea acá para devolver un 400 limpio
//     en lugar de un error críptico de Postgres.
//   * `client` viene como sub-objeto. Lo orquesta el servicio: primero crea
//     el lead, después la cita.
//   * Se exige al menos uno entre email y phone — sin contacto, el admin no
//     puede confirmar la cita.
//   * `appointment_date` se valida con la misma regla de slot que va a vivir
//     en la DB (lunes-viernes, 08:00-17:00 en `America/Merida`, hora en punto).

export const RequestClientSchema = z
  .object({
    name: z.string().min(1),
    email: z.email().optional(),
    phone: z.string().min(1).optional(),
    company_name: z.string().min(1).optional(),
  })
  .refine((c) => c.email !== undefined || c.phone !== undefined, {
    message: "at least one of email or phone is required",
  });

export const RequestAppointmentSchema = z.object({
  client: RequestClientSchema,
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

export type RequestClientInput = z.infer<typeof RequestClientSchema>;
export type RequestAppointmentRequest = z.infer<
  typeof RequestAppointmentSchema
>;

export type RequestAppointmentResult =
  | { ok: true; appointment: AppAppointment; client: AppClient }
  | { ok: false; error: string };
