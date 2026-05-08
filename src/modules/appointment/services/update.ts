import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type {
  AppAppointment,
  AppointmentResult,
  UpdateAppointmentRequest,
} from "../types/appointment";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentRequest,
  supabase: SupabaseServerClient,
): Promise<AppointmentResult> {
  const { data, error } = await supabase
    .from("appointment")
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, appointment: data as AppAppointment };
}
