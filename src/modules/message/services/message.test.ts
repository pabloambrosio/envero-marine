import { describe, expect, it } from "vitest";
import { createFakeMessageRepository } from "../../../lib/db/fakes/message-repository";
import type { MessageRepository } from "../../../lib/db/ports/message-repository";
import { createMessage } from "./create";

describe("createMessage", () => {
  it("crea el mensaje y normaliza los opcionales a null", async () => {
    const repo = createFakeMessageRepository();
    const result = await createMessage(
      {
        name: "Visitante",
        email: "visita@example.com",
        message: "Hola, quiero información.",
      },
      repo,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message.phone).toBeNull();
    expect(result.message.company_name).toBeNull();
    expect(repo.rows.size).toBe(1);
  });

  it("mapea errores de infraestructura al union { ok: false }", async () => {
    const broken: MessageRepository = {
      create: async () => {
        throw new Error("db down");
      },
    };

    const result = await createMessage(
      { name: "X", email: "x@example.com", message: "hola" },
      broken,
    );
    expect(result).toEqual({ ok: false, error: "db down" });
  });
});
