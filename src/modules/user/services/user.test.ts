import { compareSync, hashSync } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { createFakeUserRepository } from "../../../lib/db/fakes/user-repository";
import { changePassword } from "./change-password";
import { createUser } from "./create";
import { listUsers } from "./list";
import { updateProfile } from "./update-profile";
import { updateUser } from "./update";

// cost 4: suficiente para tests, rápido.
const PASSWORD = "correcta-123";

function seedAdmin() {
  return {
    id: "admin-1",
    email: "admin@local.test",
    name: "Admin",
    role: "admin" as const,
    active: true,
    created_at: new Date().toISOString(),
    password_hash: hashSync(PASSWORD, 4),
  };
}

describe("createUser", () => {
  it("crea el usuario con la password hasheada", async () => {
    const users = createFakeUserRepository();
    const result = await createUser(
      {
        email: "staff@local.test",
        name: "Staff",
        role: "staff",
        password: "una-password",
      },
      users,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.email).toBe("staff@local.test");
    expect(result.user.role).toBe("staff");
    expect(result.user.active).toBe(true);
    // AppUser no expone el hash; verificar por el puerto.
    const hash = await users.getPasswordHash(result.user.id);
    expect(hash).not.toBeNull();
    expect(hash).not.toBe("una-password");
    expect(compareSync("una-password", hash!)).toBe(true);
  });

  it("rechaza un email ya registrado", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await createUser(
      {
        email: "admin@local.test",
        name: "Otro",
        role: "staff",
        password: "una-password",
      },
      users,
    );

    expect(result).toEqual({ ok: false, error: "email_taken" });
  });
});

describe("updateUser", () => {
  it("el admin no puede desactivarse a sí mismo", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await updateUser("admin-1", { active: false }, "admin-1", users);

    expect(result).toEqual({ ok: false, error: "cannot_modify_self" });
  });

  it("el admin no puede sacarse su propio rol", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await updateUser("admin-1", { role: "staff" }, "admin-1", users);

    expect(result).toEqual({ ok: false, error: "cannot_modify_self" });
  });

  it("sí puede editar sus otros datos vía updateUser", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await updateUser(
      "admin-1",
      { name: "Nuevo nombre", role: "admin" },
      "admin-1",
      users,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.name).toBe("Nuevo nombre");
  });

  it("puede desactivar y cambiar el rol de otro usuario", async () => {
    const users = createFakeUserRepository([
      seedAdmin(),
      { ...seedAdmin(), id: "staff-1", email: "staff@local.test", role: "staff" },
    ]);
    const result = await updateUser(
      "staff-1",
      { active: false, role: "admin" },
      "admin-1",
      users,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.active).toBe(false);
    expect(result.user.role).toBe("admin");
  });

  it("rechaza un email que ya usa otro usuario", async () => {
    const users = createFakeUserRepository([
      seedAdmin(),
      { ...seedAdmin(), id: "staff-1", email: "staff@local.test", role: "staff" },
    ]);
    const result = await updateUser(
      "staff-1",
      { email: "admin@local.test" },
      "admin-1",
      users,
    );

    expect(result).toEqual({ ok: false, error: "email_taken" });
  });

  it("resetea la password de otro usuario re-hasheando", async () => {
    const users = createFakeUserRepository([
      seedAdmin(),
      { ...seedAdmin(), id: "staff-1", email: "staff@local.test", role: "staff" },
    ]);
    const result = await updateUser(
      "staff-1",
      { password: "password-nueva" },
      "admin-1",
      users,
    );

    expect(result.ok).toBe(true);
    const hash = await users.getPasswordHash("staff-1");
    expect(compareSync("password-nueva", hash!)).toBe(true);
  });

  it("devuelve not_found si el usuario no existe", async () => {
    const users = createFakeUserRepository();
    const result = await updateUser("nadie", { name: "X" }, "admin-1", users);

    expect(result).toEqual({ ok: false, error: "not_found" });
  });
});

describe("updateProfile", () => {
  it("actualiza nombre y email propios", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await updateProfile(
      "admin-1",
      { name: "Renombrado", email: "nuevo@local.test" },
      users,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.name).toBe("Renombrado");
    expect(result.user.email).toBe("nuevo@local.test");
  });

  it("rechaza el email de otro usuario, pero permite conservar el propio", async () => {
    const users = createFakeUserRepository([
      seedAdmin(),
      { ...seedAdmin(), id: "staff-1", email: "staff@local.test", role: "staff" },
    ]);

    const taken = await updateProfile(
      "staff-1",
      { email: "admin@local.test" },
      users,
    );
    const own = await updateProfile(
      "staff-1",
      { name: "Staff dos", email: "staff@local.test" },
      users,
    );

    expect(taken).toEqual({ ok: false, error: "email_taken" });
    expect(own.ok).toBe(true);
  });
});

describe("changePassword", () => {
  it("con la password actual correcta re-hashea la nueva", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await changePassword(
      "admin-1",
      { current_password: PASSWORD, new_password: "password-nueva" },
      users,
    );

    expect(result).toEqual({ ok: true });
    const hash = await users.getPasswordHash("admin-1");
    expect(compareSync("password-nueva", hash!)).toBe(true);
    expect(compareSync(PASSWORD, hash!)).toBe(false);
  });

  it("rechaza si la password actual no coincide", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await changePassword(
      "admin-1",
      { current_password: "otra", new_password: "password-nueva" },
      users,
    );

    expect(result).toEqual({ ok: false, error: "invalid_password" });
    expect(compareSync(PASSWORD, (await users.getPasswordHash("admin-1"))!)).toBe(
      true,
    );
  });
});

describe("listUsers", () => {
  it("devuelve los usuarios sin password_hash", async () => {
    const users = createFakeUserRepository([seedAdmin()]);
    const result = await listUsers(users);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.users).toHaveLength(1);
    expect(result.users[0]).not.toHaveProperty("password_hash");
  });
});
