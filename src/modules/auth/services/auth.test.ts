import { hashSync } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { createFakeAuthRepository } from "../../../lib/db/fakes/auth-repository";
import { hashSessionToken } from "../../../lib/session";
import { login } from "./login";
import { logout } from "./logout";

// cost 4: suficiente para tests, rápido.
const PASSWORD = "correcta-123";
const admin = {
  id: "user-1",
  email: "admin@local.test",
  name: "Admin",
  role: "admin" as const,
  password_hash: hashSync(PASSWORD, 4),
  active: true,
};

describe("login", () => {
  it("con credenciales válidas crea sesión y devuelve el usuario", async () => {
    const auth = createFakeAuthRepository([admin]);
    const result = await login({ email: admin.email, password: PASSWORD }, auth);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user).toEqual({ id: "user-1", email: "admin@local.test" });
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // La sesión guardada es el hash del token, nunca el token en claro.
    const stored = auth.sessions.get(hashSessionToken(result.sessionToken));
    expect(stored?.user_id).toBe("user-1");
    expect(auth.sessions.has(result.sessionToken)).toBe(false);
  });

  it("password errónea, usuario inexistente e inactivo devuelven el mismo error", async () => {
    const auth = createFakeAuthRepository([
      admin,
      { ...admin, id: "user-2", email: "inactivo@local.test", active: false },
    ]);

    const badPassword = await login(
      { email: admin.email, password: "otra" },
      auth,
    );
    const noUser = await login(
      { email: "nadie@local.test", password: PASSWORD },
      auth,
    );
    const inactive = await login(
      { email: "inactivo@local.test", password: PASSWORD },
      auth,
    );

    expect(badPassword).toEqual({ ok: false, error: "invalid_credentials" });
    expect(noUser).toEqual({ ok: false, error: "invalid_credentials" });
    expect(inactive).toEqual({ ok: false, error: "invalid_credentials" });
    expect(auth.sessions.size).toBe(0);
  });

  it("limpia las sesiones vencidas del usuario al loguear", async () => {
    const auth = createFakeAuthRepository([admin]);
    auth.sessions.set("vieja", {
      id: "vieja",
      user_id: "user-1",
      expires_at: new Date(Date.now() - 1000),
    });

    const result = await login({ email: admin.email, password: PASSWORD }, auth);

    expect(result.ok).toBe(true);
    expect(auth.sessions.has("vieja")).toBe(false);
    expect(auth.sessions.size).toBe(1);
  });
});

describe("logout", () => {
  it("borra la sesión correspondiente al token", async () => {
    const auth = createFakeAuthRepository([admin]);
    const logged = await login({ email: admin.email, password: PASSWORD }, auth);
    if (!logged.ok) throw new Error("setup failed");

    const result = await logout(logged.sessionToken, auth);

    expect(result).toEqual({ ok: true });
    expect(auth.sessions.size).toBe(0);
  });
});

describe("getSessionWithUser (contrato del puerto)", () => {
  it("rechaza sesiones vencidas y usuarios desactivados", async () => {
    const auth = createFakeAuthRepository([admin]);
    const logged = await login({ email: admin.email, password: PASSWORD }, auth);
    if (!logged.ok) throw new Error("setup failed");
    const sessionId = hashSessionToken(logged.sessionToken);

    expect(await auth.getSessionWithUser(sessionId)).not.toBeNull();

    auth.users.set("user-1", { ...admin, active: false });
    expect(await auth.getSessionWithUser(sessionId)).toBeNull();
  });
});
