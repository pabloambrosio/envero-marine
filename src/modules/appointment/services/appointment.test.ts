import { describe, expect, it } from "vitest";
import { createFakeAppointmentRepository } from "../../../lib/db/fakes/appointment-repository";
import type { AppointmentRepository } from "../../../lib/db/ports/appointment-repository";
import { getAppointment } from "./get";
import { listAppointments } from "./list";
import { requestAppointment } from "./request";
import { updateAppointment } from "./update";

const validRequest = {
  name: "Cliente Prueba",
  phone: "+52 999 123 4567",
  // Lunes 10:00 America/Merida (16:00 UTC) — slot válido.
  appointment_date: "2026-08-17T16:00:00.000Z",
};

describe("requestAppointment (flujo público)", () => {
  it("crea la cita con status pending forzado", async () => {
    const repo = createFakeAppointmentRepository();
    const result = await requestAppointment(validRequest, repo);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.appointment.status).toBe("pending");
    expect(repo.rows.get(result.appointment.id)?.status).toBe("pending");
  });

  it("mapea errores de infraestructura al union { ok: false }", async () => {
    const broken: AppointmentRepository = {
      create: async () => {
        throw new Error("db down");
      },
      list: async () => [],
      getById: async () => null,
      update: async () => null,
    };

    const result = await requestAppointment(validRequest, broken);
    expect(result).toEqual({ ok: false, error: "db down" });
  });
});

describe("getAppointment / updateAppointment", () => {
  it("devuelven not_found cuando el id no existe", async () => {
    const repo = createFakeAppointmentRepository();

    const got = await getAppointment("nope", repo);
    expect(got).toEqual({ ok: false, error: "not_found" });

    const updated = await updateAppointment("nope", { status: "confirmed" }, repo);
    expect(updated).toEqual({ ok: false, error: "not_found" });
  });

  it("update aplica el patch y conserva el resto", async () => {
    const repo = createFakeAppointmentRepository();
    const created = await requestAppointment(validRequest, repo);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateAppointment(
      created.appointment.id,
      { status: "confirmed", notes: "confirmada por teléfono" },
      repo,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.appointment.status).toBe("confirmed");
    expect(result.appointment.notes).toBe("confirmada por teléfono");
    expect(result.appointment.name).toBe(validRequest.name);
  });
});

describe("listAppointments", () => {
  it("devuelve las citas existentes", async () => {
    const repo = createFakeAppointmentRepository();
    await requestAppointment(validRequest, repo);
    await requestAppointment({ ...validRequest, name: "Otro Cliente" }, repo);

    const result = await listAppointments(repo);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.appointments).toHaveLength(2);
  });
});
