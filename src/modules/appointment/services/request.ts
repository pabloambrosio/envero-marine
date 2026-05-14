import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import { createClient } from "../../client/services/create";
import type {
  RequestAppointmentRequest,
  RequestAppointmentResult,
} from "../types/request";
import { createAppointment } from "./create";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

// Orquesta el flujo público anónimo: crea el lead en `client` y, si sale
// bien, crea la cita en `appointment` con status pending y sin vendor.
//
// No hace rollback si el segundo paso falla: el cliente Supabase anon no
// tiene DELETE sobre `client` (la RLS no se lo permite) y la tabla está
// pensada laxa, así que un lead huérfano es ruido en CRM, no un bug. Si en
// algún momento se vuelve un problema, se mueve a una RPC plpgsql con
// transacción real (mismo patrón que `reorder_questions`).
export async function requestAppointment(
  input: RequestAppointmentRequest,
  supabase: SupabaseServerClient,
): Promise<RequestAppointmentResult> {
  const clientResult = await createClient(input.client, supabase);
  if (!clientResult.ok) return { ok: false, error: clientResult.error };

  const apptResult = await createAppointment(
    {
      client_id: clientResult.client.id,
      appointment_date: input.appointment_date,
      status: "pending",
      quiz_snapshot: {},
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
    supabase,
  );

  if (!apptResult.ok) {
    return { ok: false, error: apptResult.error };
  }

  return {
    ok: true,
    appointment: apptResult.appointment,
    client: clientResult.client,
  };
}
