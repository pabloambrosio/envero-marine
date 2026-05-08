import type { APIRoute } from "astro";
import { json, validateBody } from "../../../../lib/http";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { listAppointments } from "../../../../modules/appointment/services/list";
import { createAppointment } from "../../../../modules/appointment/services/create";
import { CreateAppointmentSchema } from "../../../../modules/appointment/types/appointment";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await listAppointments(supabase);

  return result.ok
    ? json({ appointments: result.appointments })
    : json({ error: result.error }, 500);
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, CreateAppointmentSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await createAppointment(validated.data, supabase);

  return result.ok
    ? json({ appointment: result.appointment }, 201)
    : json({ error: result.error }, 400);
};
