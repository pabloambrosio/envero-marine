import type {
  AuthRepository,
  AuthUser,
  NewSession,
} from "../ports/auth-repository";

export interface FakeAuthRepository extends AuthRepository {
  users: Map<string, AuthUser>;
  sessions: Map<string, NewSession>;
}

export function createFakeAuthRepository(
  seedUsers: AuthUser[] = [],
): FakeAuthRepository {
  const users = new Map(seedUsers.map((u) => [u.id, u]));
  const sessions = new Map<string, NewSession>();

  return {
    users,
    sessions,

    async findUserByEmail(email: string) {
      return [...users.values()].find((u) => u.email === email) ?? null;
    },

    async createSession(input: NewSession) {
      sessions.set(input.id, input);
    },

    async getSessionWithUser(id: string) {
      const session = sessions.get(id);
      if (!session || session.expires_at <= new Date()) return null;
      const user = users.get(session.user_id);
      if (!user || !user.active) return null;
      return {
        expires_at: session.expires_at,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    },

    async deleteSession(id: string) {
      sessions.delete(id);
    },

    async deleteExpiredSessions(user_id: string) {
      for (const [id, s] of sessions) {
        if (s.user_id === user_id && s.expires_at <= new Date()) {
          sessions.delete(id);
        }
      }
    },
  };
}
