import type { APIRoute } from "astro";
import { json, validateBody } from "../../lib/http";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { requestAppointment } from "../../modules/appointment/services/request";
import { RequestAppointmentSchema } from "../../modules/appointment/types/request";

export const prerender = false;

// Endpoint público anónimo. NO está bajo ningún PROTECTED_PREFIX del
// middleware (`/admin/*`, `/api/admin/*`, `/vendors/*`, `/api/vendors/*`),
// así que el visitante llega directo sin pasar por getUser ni cookies.
//
// Por qué service-role acá:
//   La RLS sí permite el INSERT de anon (`client_anon_insert` y
//   `appointment_anon_insert`), pero PostgREST aplica RLS también al SELECT
//   implícito del `INSERT ... RETURNING *` que hace supabase-js (.insert()
//   .select().single()), y no abrimos SELECT a anon en `client` ni en
//   `appointment` (expondría leads y citas a cualquiera). Bypasseando RLS
//   con service-role server-side resolvemos ese problema sin abrir lecturas
//   públicas. La integridad la cuida el código del servicio.
//
// Defensa en capas que sigue activa:
//   * Zod (RequestAppointmentSchema) rechaza vendor_id, status y slots
//     fuera de horario antes de tocar la DB.
//   * El servicio fuerza explícitamente `status: 'pending'`, sin
//     `vendor_id`, sin `quiz_id`. Equivale en código a lo que la RLS de
//     anon expresa en SQL.
//   * CHECK + partial unique index en la DB siguen aplicando (no dependen
//     del rol): hora válida y un solo confirmed/completed por slot.
export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, RequestAppointmentSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseAdminClient();
  const result = await requestAppointment(validated.data, supabase);

  return result.ok
    ? json({ appointment: result.appointment, client: result.client }, 201)
    : json({ error: result.error }, 400);
};
