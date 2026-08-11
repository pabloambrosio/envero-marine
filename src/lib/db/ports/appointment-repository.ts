// Puerto del agregado appointment. Define el contrato y los tipos de dominio;
// no importa nada de Prisma ni de ninguna DB concreta. Las fechas son strings
// ISO — la conversión desde el tipo nativo del driver es trabajo del adapter.
//
// Errores: getById/update devuelven null si el registro no existe; los fallos
// de infraestructura (conexión, SQL) se lanzan y los mapea el servicio.

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface AppAppointment {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company_name: string | null;
  appointment_date: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewAppointment {
  name: string;
  email?: string;
  phone: string;
  company_name?: string;
  appointment_date: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentPatch {
  status?: AppointmentStatus;
  appointment_date?: string;
  company_name?: string | null;
  notes?: string | null;
}

export interface AppointmentRepository {
  create(input: NewAppointment): Promise<AppAppointment>;
  list(): Promise<AppAppointment[]>;
  getById(id: string): Promise<AppAppointment | null>;
  update(id: string, patch: AppointmentPatch): Promise<AppAppointment | null>;
}
