// Puerto del agregado user (cuentas del panel). Define el contrato y los
// tipos de dominio; no importa nada de Prisma ni de ninguna DB concreta.
//
// AppUser nunca lleva el password_hash: es lo que viaja a la UI. Para
// verificar la password actual está getPasswordHash, y punto.
//
// Errores: getById/update devuelven null si el registro no existe; los fallos
// de infraestructura (conexión, SQL) se lanzan y los mapea el servicio.

export type UserRole = "admin" | "staff";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export interface NewUser {
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
}

export interface UserPatch {
  email?: string;
  name?: string;
  role?: UserRole;
  active?: boolean;
  password_hash?: string;
}

export interface UserRepository {
  create(input: NewUser): Promise<AppUser>;
  list(): Promise<AppUser[]>;
  getById(id: string): Promise<AppUser | null>;
  getByEmail(email: string): Promise<AppUser | null>;
  getPasswordHash(id: string): Promise<string | null>;
  update(id: string, patch: UserPatch): Promise<AppUser | null>;
}
