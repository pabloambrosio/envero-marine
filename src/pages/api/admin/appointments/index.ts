import type { APIRoute } from "astro";
import { getRepositories } from "../../../../lib/db";
import { json, validateBody } from "../../../../lib/http";
import { createAppointment } from "../../../../modules/appointment/services/create";
import { listAppointments } from "../../../../modules/appointment/services/list";
import { CreateAppointmentSchema } from "../../../../modules/appointment/types/appointment";

export const prerender = false;

export const GET: APIRoute = async () => {
  const result = await listAppointments(getRepositories().appointments);

  return result.ok
    ? json({ appointments: result.appointments })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request }) => {
  const validated = await validateBody(request, CreateAppointmentSchema);
  if (!validated.ok) return validated.response;

  const result = await createAppointment(
    validated.data,
    getRepositories().appointments,
  );

  return result.ok
    ? json({ appointment: result.appointment }, 201)
    : json({ error: result.error }, 400);
};
