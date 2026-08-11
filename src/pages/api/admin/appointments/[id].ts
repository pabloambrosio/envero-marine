import type { APIRoute } from "astro";
import { getRepositories } from "../../../../lib/db";
import { json, validateBody } from "../../../../lib/http";
import { getAppointment } from "../../../../modules/appointment/services/get";
import { updateAppointment } from "../../../../modules/appointment/services/update";
import { UpdateAppointmentSchema } from "../../../../modules/appointment/types/appointment";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const result = await getAppointment(params.id!, getRepositories().appointments);

  if (result.ok) return json({ appointment: result.appointment });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const validated = await validateBody(request, UpdateAppointmentSchema);
  if (!validated.ok) return validated.response;

  const result = await updateAppointment(
    params.id!,
    validated.data,
    getRepositories().appointments,
  );

  if (result.ok) return json({ appointment: result.appointment });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};
