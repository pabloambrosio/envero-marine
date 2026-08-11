import type { AppointmentRepository } from "../../../lib/db/ports/appointment-repository";
import type { AppointmentResult } from "../types/appointment";

export async function getAppointment(
  id: string,
  appointments: AppointmentRepository,
): Promise<AppointmentResult> {
  try {
    const appointment = await appointments.getById(id);
    if (!appointment) return { ok: false, error: "not_found" };
    return { ok: true, appointment };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
