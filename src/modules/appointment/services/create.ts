import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type {
  AppAppointment,
  AppointmentResult,
  CreateAppointmentRequest,
} from "../types/appointment";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function createAppointment(
  input: CreateAppointmentRequest,
  supabase: SupabaseServerClient,
): Promise<AppointmentResult> {
  const { data, error } = await supabase
    .from("appointment")
    .insert(input)
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, appointment: data as AppAppointment };
}
