// Puerto de auth: usuarios staff + sesiones opacas.
//
// El `id` de una sesión es el SHA-256 hex del token que viaja en la cookie
// (ver src/lib/session.ts). Este puerto nunca ve el token en claro.

import type { UserRole } from "./user-repository";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
  active: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SessionWithUser {
  expires_at: Date;
  user: SessionUser;
}

export interface NewSession {
  id: string;
  user_id: string;
  expires_at: Date;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  createSession(input: NewSession): Promise<void>;
  /** Devuelve null si la sesión no existe, expiró o el usuario está inactivo. */
  getSessionWithUser(id: string): Promise<SessionWithUser | null>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(user_id: string): Promise<void>;
}
