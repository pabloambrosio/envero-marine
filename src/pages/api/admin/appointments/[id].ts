import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getAppointment } from "../../../../modules/appointment/services/get";
import { updateAppointment } from "../../../../modules/appointment/services/update";
import { UpdateAppointmentSchema } from "../../../../modules/appointment/types/appointment";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await getAppointment(params.id!, supabase);

  if (result.ok) return json({ appointment: result.appointment });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 500);
};

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const validated = await validateBody(request, UpdateAppointmentSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await updateAppointment(params.id!, validated.data, supabase);

  if (result.ok) return json({ appointment: result.appointment });
  if (result.error === "not_found") return json({ error: "not_found" }, 404);
  return json({ error: result.error }, 400);
};
