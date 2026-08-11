import type { PrismaClient } from "../../../generated/prisma/client";
import type { AuthRepository, NewSession } from "../ports/auth-repository";
import type { UserRole } from "../ports/user-repository";

export function createPrismaAuthRepository(prisma: PrismaClient): AuthRepository {
  return {
    async findUserByEmail(email: string) {
      const row = await prisma.user.findUnique({ where: { email } });
      if (!row) return null;
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role as UserRole,
        password_hash: row.passwordHash,
        active: row.active,
      };
    },

    async createSession(input: NewSession) {
      await prisma.session.create({
        data: {
          id: input.id,
          userId: input.user_id,
          expiresAt: input.expires_at,
        },
      });
    },

    async getSessionWithUser(id: string) {
      const row = await prisma.session.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!row || row.expiresAt <= new Date() || !row.user.active) return null;
      return {
        expires_at: row.expiresAt,
        user: {
          id: row.user.id,
          email: row.user.email,
          name: row.user.name,
          role: row.user.role as UserRole,
        },
      };
    },

    async deleteSession(id: string) {
      await prisma.session.deleteMany({ where: { id } });
    },

    async deleteExpiredSessions(user_id: string) {
      await prisma.session.deleteMany({
        where: { userId: user_id, expiresAt: { lte: new Date() } },
      });
    },
  };
}
