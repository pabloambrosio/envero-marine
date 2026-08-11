import type { PrismaClient } from "../../../generated/prisma/client";
import type {
  AppointmentPatch,
  AppointmentRepository,
  NewAppointment,
} from "../ports/appointment-repository";
import { toAppAppointment } from "./mappers";

export function createPrismaAppointmentRepository(
  prisma: PrismaClient,
): AppointmentRepository {
  return {
    async create(input: NewAppointment) {
      const row = await prisma.appointment.create({
        data: {
          name: input.name,
          email: input.email ?? null,
          phone: input.phone,
          companyName: input.company_name ?? null,
          appointmentDate: new Date(input.appointment_date),
          status: input.status ?? "pending",
          notes: input.notes ?? null,
        },
      });
      return toAppAppointment(row);
    },

    async list() {
      const rows = await prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toAppAppointment);
    },

    async getById(id: string) {
      const row = await prisma.appointment.findUnique({ where: { id } });
      return row ? toAppAppointment(row) : null;
    },

    async update(id: string, patch: AppointmentPatch) {
      // updateMany + re-read en vez de update: update lanza P2025 cuando el
      // id no existe, y "no existe" acá es un null del contrato, no un error.
      const { count } = await prisma.appointment.updateMany({
        where: { id },
        data: {
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.appointment_date !== undefined
            ? { appointmentDate: new Date(patch.appointment_date) }
            : {}),
          ...(patch.company_name !== undefined
            ? { companyName: patch.company_name }
            : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        },
      });
      if (count === 0) return null;
      const row = await prisma.appointment.findUnique({ where: { id } });
      return row ? toAppAppointment(row) : null;
    },
  };
}
