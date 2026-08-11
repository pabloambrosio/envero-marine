import type { AppointmentRepository } from "../../../lib/db/ports/appointment-repository";
import type {
  AppointmentResult,
  UpdateAppointmentRequest,
} from "../types/appointment";

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentRequest,
  appointments: AppointmentRepository,
): Promise<AppointmentResult> {
  try {
    const appointment = await appointments.update(id, input);
    if (!appointment) return { ok: false, error: "not_found" };
    return { ok: true, appointment };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
