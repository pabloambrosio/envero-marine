// Implementación en memoria del puerto, para tests de servicios. Mismo
// contrato que el adapter Prisma; `rows` queda expuesto para asserts.

import { randomUUID } from "node:crypto";
import type {
  AppAppointment,
  AppointmentPatch,
  AppointmentRepository,
  NewAppointment,
} from "../ports/appointment-repository";

export interface FakeAppointmentRepository extends AppointmentRepository {
  rows: Map<string, AppAppointment>;
}

export function createFakeAppointmentRepository(
  seed: AppAppointment[] = [],
): FakeAppointmentRepository {
  const rows = new Map(seed.map((r) => [r.id, r]));

  return {
    rows,

    async create(input: NewAppointment) {
      const now = new Date().toISOString();
      const appointment: AppAppointment = {
        id: randomUUID(),
        name: input.name,
        email: input.email ?? null,
        phone: input.phone,
        company_name: input.company_name ?? null,
        appointment_date: new Date(input.appointment_date).toISOString(),
        status: input.status ?? "pending",
        notes: input.notes ?? null,
        created_at: now,
        updated_at: now,
      };
      rows.set(appointment.id, appointment);
      return appointment;
    },

    async list() {
      return [...rows.values()].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    },

    async getById(id: string) {
      return rows.get(id) ?? null;
    },

    async update(id: string, patch: AppointmentPatch) {
      const row = rows.get(id);
      if (!row) return null;
      const updated: AppAppointment = {
        ...row,
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.appointment_date !== undefined
          ? { appointment_date: new Date(patch.appointment_date).toISOString() }
          : {}),
        ...(patch.company_name !== undefined
          ? { company_name: patch.company_name }
          : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        updated_at: new Date().toISOString(),
      };
      rows.set(id, updated);
      return updated;
    },
  };
}
