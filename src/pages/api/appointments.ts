import type { APIRoute } from "astro";
import { getRepositories } from "../../lib/db";
import { json, validateBody } from "../../lib/http";
import { requestAppointment } from "../../modules/appointment/services/request";
import { RequestAppointmentSchema } from "../../modules/appointment/types/request";

export const prerender = false;

// Endpoint público anónimo. NO está bajo ningún PROTECTED_PREFIX del
// middleware (`/admin/*`, `/api/admin/*`), así que el visitante llega
// directo sin pasar por la sesión.
//
// Defensa en capas:
//   * Zod (RequestAppointmentSchema) rechaza status y slots fuera de
//     horario antes de tocar la DB.
//   * El servicio fuerza explícitamente `status: 'pending'` — el visitante
//     nunca puede mandar otro.
export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, RequestAppointmentSchema);
  if (!validated.ok) return validated.response;

  const result = await requestAppointment(
    validated.data,
    getRepositories().appointments,
  );

  return result.ok
    ? json({ appointment: result.appointment }, 201)
    : json({ error: result.error }, 400);
};
