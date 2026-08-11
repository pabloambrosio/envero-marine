import type {
  AppUser,
  NewUser,
  UserPatch,
  UserRepository,
} from "../ports/user-repository";

interface FakeUserRow extends AppUser {
  password_hash: string;
}

export interface FakeUserRepository extends UserRepository {
  rows: Map<string, FakeUserRow>;
}

export function createFakeUserRepository(
  seedUsers: FakeUserRow[] = [],
): FakeUserRepository {
  const rows = new Map(seedUsers.map((u) => [u.id, u]));

  return {
    rows,

    async create(input: NewUser) {
      const row: FakeUserRow = {
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        role: input.role,
        active: true,
        created_at: new Date().toISOString(),
        password_hash: input.password_hash,
      };
      rows.set(row.id, row);
      const { password_hash, ...user } = row;
      return user;
    },

    async list() {
      return [...rows.values()].map(({ password_hash, ...user }) => user);
    },

    async getById(id: string) {
      const row = rows.get(id);
      if (!row) return null;
      const { password_hash, ...user } = row;
      return user;
    },

    async getByEmail(email: string) {
      const row = [...rows.values()].find((u) => u.email === email);
      if (!row) return null;
      const { password_hash, ...user } = row;
      return user;
    },

    async getPasswordHash(id: string) {
      return rows.get(id)?.password_hash ?? null;
    },

    async update(id: string, patch: UserPatch) {
      const row = rows.get(id);
      if (!row) return null;
      const updated: FakeUserRow = {
        ...row,
        ...(patch.email !== undefined ? { email: patch.email } : {}),
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.role !== undefined ? { role: patch.role } : {}),
        ...(patch.active !== undefined ? { active: patch.active } : {}),
        ...(patch.password_hash !== undefined
          ? { password_hash: patch.password_hash }
          : {}),
      };
      rows.set(id, updated);
      const { password_hash, ...user } = updated;
      return user;
    },
  };
}
