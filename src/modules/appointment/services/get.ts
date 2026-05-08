import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppAppointment, AppointmentResult } from "../types/appointment";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getAppointment(
  id: string,
  supabase: SupabaseServerClient,
): Promise<AppointmentResult> {
  const { data, error } = await supabase
    .from("appointment")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, appointment: data as AppAppointment };
}
