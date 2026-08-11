import type { AppointmentRepository } from "../../../lib/db/ports/appointment-repository";
import type { AppointmentsResult } from "../types/appointment";

export async function listAppointments(
  appointments: AppointmentRepository,
): Promise<AppointmentsResult> {
  try {
    return { ok: true, appointments: await appointments.list() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
