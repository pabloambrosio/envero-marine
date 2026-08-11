// Fila Prisma → tipo de dominio del puerto. Acá muere todo lo específico de
// Prisma: camelCase de los modelos y Date nativos. Los puertos hablan
// snake_case + ISO strings, igual que hablaba la API con Supabase.

import type { Appointment, Message, User } from "../../../generated/prisma/client";
import type { AppAppointment, AppointmentStatus } from "../ports/appointment-repository";
import type { AppMessage } from "../ports/message-repository";
import type { AppUser, UserRole } from "../ports/user-repository";

export function toAppAppointment(row: Appointment): AppAppointment {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company_name: row.companyName,
    appointment_date: row.appointmentDate.toISOString(),
    status: row.status as AppointmentStatus,
    notes: row.notes,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function toAppUser(row: User): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    active: row.active,
    created_at: row.createdAt.toISOString(),
  };
}

export function toAppMessage(row: Message): AppMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company_name: row.companyName,
    message: row.message,
    created_at: row.createdAt.toISOString(),
  };
}
