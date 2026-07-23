import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type {
  RequestAppointmentRequest,
  RequestAppointmentResult,
} from "../types/request";
import { createAppointment } from "./create";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

// Flujo público anónimo: crea la cita directo, sin tabla client de por
// medio. Fuerza status pending — el visitante nunca puede mandar otro.
export async function requestAppointment(
  input: RequestAppointmentRequest,
  supabase: SupabaseServerClient,
): Promise<RequestAppointmentResult> {
  const apptResult = await createAppointment(
    {
      name: input.name,
      phone: input.phone,
      appointment_date: input.appointment_date,
      status: "pending",
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.company_name !== undefined
        ? { company_name: input.company_name }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
    supabase,
  );

  if (!apptResult.ok) {
    return { ok: false, error: apptResult.error };
  }

  return { ok: true, appointment: apptResult.appointment };
}
