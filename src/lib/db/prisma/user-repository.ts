import type { PrismaClient } from "../../../generated/prisma/client";
import type {
  NewUser,
  UserPatch,
  UserRepository,
} from "../ports/user-repository";
import { toAppUser } from "./mappers";

export function createPrismaUserRepository(prisma: PrismaClient): UserRepository {
  return {
    async create(input: NewUser) {
      const row = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          passwordHash: input.password_hash,
        },
      });
      return toAppUser(row);
    },

    async list() {
      const rows = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toAppUser);
    },

    async getById(id: string) {
      const row = await prisma.user.findUnique({ where: { id } });
      return row ? toAppUser(row) : null;
    },

    async getByEmail(email: string) {
      const row = await prisma.user.findUnique({ where: { email } });
      return row ? toAppUser(row) : null;
    },

    async getPasswordHash(id: string) {
      const row = await prisma.user.findUnique({
        where: { id },
        select: { passwordHash: true },
      });
      return row?.passwordHash ?? null;
    },

    async update(id: string, patch: UserPatch) {
      // updateMany + re-read en vez de update: update lanza P2025 cuando el
      // id no existe, y "no existe" acá es un null del contrato, no un error.
      const { count } = await prisma.user.updateMany({
        where: { id },
        data: {
          ...(patch.email !== undefined ? { email: patch.email } : {}),
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.role !== undefined ? { role: patch.role } : {}),
          ...(patch.active !== undefined ? { active: patch.active } : {}),
          ...(patch.password_hash !== undefined
            ? { passwordHash: patch.password_hash }
            : {}),
        },
      });
      if (count === 0) return null;
      const row = await prisma.user.findUnique({ where: { id } });
      return row ? toAppUser(row) : null;
    },
  };
}
