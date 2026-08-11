// Único punto de cableado de la capa de datos. Los endpoints piden
// getRepositories() y reciben los puertos; qué DB hay detrás es un detalle
// de esta carpeta. Cambiar de base (volver a Supabase, lo que sea) =
// implementar los puertos en una carpeta hermana y recablear acá.

import type { AppointmentRepository } from "./ports/appointment-repository";
import type { AuthRepository } from "./ports/auth-repository";
import type { MessageRepository } from "./ports/message-repository";
import type { UserRepository } from "./ports/user-repository";
import { createPrismaAppointmentRepository } from "./prisma/appointment-repository";
import { createPrismaAuthRepository } from "./prisma/auth-repository";
import { getPrismaClient } from "./prisma/client";
import { createPrismaMessageRepository } from "./prisma/message-repository";
import { createPrismaUserRepository } from "./prisma/user-repository";

export interface Repositories {
  appointments: AppointmentRepository;
  messages: MessageRepository;
  auth: AuthRepository;
  users: UserRepository;
}

let repositories: Repositories | undefined;

export function getRepositories(): Repositories {
  if (!repositories) {
    const prisma = getPrismaClient();
    repositories = {
      appointments: createPrismaAppointmentRepository(prisma),
      messages: createPrismaMessageRepository(prisma),
      auth: createPrismaAuthRepository(prisma),
      users: createPrismaUserRepository(prisma),
    };
  }
  return repositories;
}
