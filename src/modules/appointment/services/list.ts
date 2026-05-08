import type { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { AppAppointment, AppointmentsResult } from "../types/appointment";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function listAppointments(
  supabase: SupabaseServerClient,
): Promise<AppointmentsResult> {
  const { data, error } = await supabase
    .from("appointment")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, appointments: (data ?? []) as AppAppointment[] };
}
