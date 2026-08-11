# CRUD de usuarios + rol Admin

Fecha: 2026-08-11 · Rama: `feat/node-adapter-hostgator`

## Problema

El panel `/admin` tiene una sola clase de usuario (tabla `user` sin rol) y ningún
lugar donde gestionar cuentas: ni el cliente puede editar sus datos personales,
ni puede dar de alta más usuarios. Hace falta un CRUD de usuarios y, para
sostenerlo, introducir el rol Admin que hoy no existe.

## Decisiones (validadas con el cliente)

- **Permisos**: dos niveles. Todos los usuarios logueados ven el panel completo
  y editan su propio perfil; solo el Admin accede a la sección Usuarios.
- **Perfil**: nombre + email + password. Se agrega columna `name`.
- **Baja**: solo desactivación vía el flag `active` existente. Sin borrado físico.
- **Alta**: el Admin define la password inicial y la comunica por fuera (no hay
  servicio de email en el stack).
- **Modelado**: `role ENUM('admin','staff')` en `user`, enforcement centralizado
  en el middleware. Se descartó el boolean `is_admin` (chequeo por endpoint,
  fácil de olvidar) y un sistema de permisos granular (YAGNI).

## Schema y migración

- `user` gana `name VARCHAR(255) NOT NULL DEFAULT ''` y
  `role ENUM('admin','staff') NOT NULL DEFAULT 'staff'` (enum Prisma `UserRole`).
- La migración corre `UPDATE user SET role = 'admin'` sobre las filas
  existentes: hoy los únicos usuarios son el cliente.
- `scripts/seed-admin.js` crea con `role: 'admin'`.

## Capa de datos

- Puerto nuevo `src/lib/db/ports/user-repository.ts`: `listUsers`,
  `findUserById`, `findUserByEmail`, `createUser`, `updateUser` (parcial:
  name/email/role/active/password_hash). Tipo de dominio `AppUser` en
  snake_case; el `password_hash` nunca viaja a la UI.
- `SessionUser` (puerto de auth) gana `name` y `role`. El middleware carga el
  usuario de la sesión en cada request, así que cambios de rol o
  desactivaciones pegan inmediato — `getSessionWithUser` ya devuelve `null`
  para usuarios inactivos.
- Implementación Prisma + fake en memoria, cableados en `getRepositories()`.

## Servicios (`src/modules/user/`)

Mismo contrato que el resto: `{ ok: true, ... } | { ok: false, error }`, puerto
inyectado, try/catch en el servicio.

- `list-users`, `create-user` (email único → `email_taken`; password mínimo 8),
  `update-user`.
- `update-profile` (nombre/email propios) y `change-password` (exige password
  actual, `bcrypt.compare` antes de re-hashear con cost 12).
- Anti-lockout en `update-user`: un admin no puede desactivarse a sí mismo ni
  quitarse el rol (`cannot_modify_self`). Como la baja es solo `active = false`,
  siempre queda al menos un admin activo.

## Enforcement y endpoints

- Middleware: si el path es `/admin/users*` o `/api/admin/users*` y
  `locals.user.role !== 'admin'` → 403 en API, redirect a `/admin` en páginas.
- `GET/POST /api/admin/users`, `GET/PATCH /api/admin/users/[id]` — solo admin.
  El PATCH permite además resetear la password de otro usuario (no hay email
  para recuperación).
- `GET/PATCH /api/admin/me` — cualquier usuario logueado: perfil y cambio de
  password.

## UI

- `/admin/users` (tabla estilo appointments: nombre, email, rol en mono,
  estado), `/admin/users/new`, `/admin/users/[id]/edit`.
- `/admin/profile` — datos propios + cambio de password, linkeado desde el
  email que ya muestra el header de `AdminLayout`.
- Card "02 / Usuarios" en el dashboard, visible solo para admins (`guard`
  expone `role`).

## Tests

Vitest sobre los servicios nuevos contra el fake, como `auth.test.ts`: email
duplicado, password corta, anti-lockout, password actual incorrecta.
