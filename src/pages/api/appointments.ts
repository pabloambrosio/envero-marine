import type { APIRoute } from "astro";
import { json, validateBody } from "../../lib/http";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { requestAppointment } from "../../modules/appointment/services/request";
import { RequestAppointmentSchema } from "../../modules/appointment/types/request";

export const prerender = false;

// Endpoint público anónimo. NO está bajo ningún PROTECTED_PREFIX del
// middleware (`/admin/*`, `/api/admin/*`), así que el visitante llega
// directo sin pasar por getUser ni cookies.
//
// Por qué service-role acá:
//   La RLS sí permite el INSERT de anon (`appointment_anon_insert`), pero
//   PostgREST aplica RLS también al SELECT implícito del
//   `INSERT ... RETURNING *` que hace supabase-js (.insert().select()), y
//   no abrimos SELECT a anon en `appointment` (expondría todas las citas a
//   cualquiera). Bypasseando RLS con service-role server-side resolvemos
//   ese problema sin abrir lecturas públicas. La integridad la cuida el
//   código del servicio.
//
// Defensa en capas que sigue activa:
//   * Zod (RequestAppointmentSchema) rechaza status y slots fuera de
//     horario antes de tocar la DB.
//   * El servicio fuerza explícitamente `status: 'pending'`. Equivale en
//     código a lo que la RLS de anon expresa en SQL.
export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, RequestAppointmentSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseAdminClient();
  const result = await requestAppointment(validated.data, supabase);

  return result.ok
    ? json({ appointment: result.appointment }, 201)
    : json({ error: result.error }, 400);
};
