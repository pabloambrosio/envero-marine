import type { AppointmentRepository } from "../../../lib/db/ports/appointment-repository";
import type {
  AppointmentResult,
  CreateAppointmentRequest,
} from "../types/appointment";

export async function createAppointment(
  input: CreateAppointmentRequest,
  appointments: AppointmentRepository,
): Promise<AppointmentResult> {
  try {
    const appointment = await appointments.create(input);
    return { ok: true, appointment };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
