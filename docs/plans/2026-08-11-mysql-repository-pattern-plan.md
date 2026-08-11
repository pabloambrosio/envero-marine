# Plan de implementación: MySQL + patrón repositorio

Fecha: 2026-08-11 · Rama: `feat/node-adapter-hostgator`
Diseño aprobado: [2026-08-11-mysql-repository-pattern-design.md](2026-08-11-mysql-repository-pattern-design.md)

Pasos ordenados; cada uno deja el repo en un estado coherente. Los pasos 1–4 no rompen nada de lo existente; el corte con Supabase ocurre en los pasos 5–8 (van juntos en un mismo estado de trabajo).

## 1. Dependencias

- Quitar: `@supabase/ssr`, `@supabase/supabase-js`, devDep `supabase`.
- Agregar: `@prisma/adapter-mariadb`, `mariadb` (driver, usado también por el seed), `bcryptjs`.
- Agregar dev: `prisma`, `vitest`.
- Script `postinstall: prisma generate` para regenerar el client tras cada install.

## 2. Infra dev: docker + env

- `docker-compose.yml` en raíz: servicio `db` con `mysql:8`, base `envero_marine`, usuario `envero`/`envero`, puerto **3310** en el host (evita chocar con un MySQL local), volumen nombrado.
- `.env`: reemplazar las `SUPABASE_*` por `DATABASE_URL=mysql://envero:envero@127.0.0.1:3310/envero_marine`. `ADMIN_EMAIL`/`ADMIN_PASSWORD` se quedan.
- Scripts yarn: `db:up`, `db:down`, `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`), `db:studio`.

## 3. Prisma: schema, config, migración inicial

- `prisma/schema.prisma`:
  - `generator client { provider = "prisma-client", output = "../src/generated/prisma" }` — client TS generado, sin engines Rust (Prisma 7).
  - `datasource db { provider = "mysql" }`.
  - Modelos `Appointment` (`@@map("appointment")`), `Message` (`@@map("message")`), `User` (`@@map("user")`), `Session` (`@@map("session")`) con columnas snake_case vía `@map`, según el diseño. `id String @id @default(uuid()) @db.Char(36)`, `status AppointmentStatus @default(pending)`, `updatedAt @updatedAt`, índices de `appointment` (status, date) portados del SQL de Supabase.
  - `Session.id` = SHA-256 hex del token (`@db.Char(64)`), FK a `User` con `onDelete: Cascade`, índice por `userId`.
- `prisma.config.ts` con `env("DATABASE_URL")`.
- `src/generated/` al `.gitignore`.
- `yarn prisma migrate dev --name init` contra el MySQL de docker → `prisma/migrations/`.

## 4. Capa de datos: puertos + adapter Prisma

- `src/lib/db/ports/appointment-repository.ts` — mueve acá los tipos de dominio (`AppAppointment`, `AppointmentStatus`) e interface: `create(input)`, `list()`, `getById(id)`, `update(id, patch)`. `getById`/`update` devuelven `null` si no existe; los errores de infraestructura se lanzan.
- `src/lib/db/ports/message-repository.ts` — `AppMessage` + `create(input)`.
- `src/lib/db/ports/auth-repository.ts` — `AuthUser { id, email, passwordHash, active }`, `findUserByEmail(email)`, `createSession({ id, userId, expiresAt })`, `getSessionWithUser(id)` (solo sesiones no expiradas), `deleteSession(id)`, `deleteExpiredSessions(userId)`.
- `src/lib/db/prisma/client.ts` — singleton `PrismaClient` con `PrismaMariaDb`, `DATABASE_URL` desde `astro:env/server` (secret → `process.env` en runtime).
- `src/lib/db/prisma/*.ts` — implementaciones; `mappers.ts` convierte filas Prisma → tipos de dominio (`Date` → ISO string).
- `src/lib/db/index.ts` — `getRepositories()` memoizado devuelve `{ appointments, messages, auth }`. Único punto de cableado.
- `src/modules/*/types/*` re-exportan los tipos de dominio desde los puertos para no romper imports del frontend admin.

## 5. Sesiones y auth

- `src/lib/session.ts` — `SESSION_COOKIE`, TTL 30 días, `generateSessionToken()` (32 bytes random, base64url), `hashSessionToken()` (SHA-256 hex, `node:crypto`), `sessionCookieOptions(expiresAt)` (HttpOnly, `Secure`, `SameSite=Lax`, path `/`).
- `modules/auth/services/login.ts` — `login(input, auth)`: busca user por email (activo), `bcrypt.compare`, borra sesiones expiradas, crea sesión. Devuelve `{ ok: true, user, sessionToken, expiresAt }`. La cookie la setea el endpoint (HTTP queda en la capa endpoint, como manda la convención de tres capas).
- `modules/auth/services/logout.ts` — `logout(token, auth)`: borra la sesión; siempre `{ ok: true }`.
- Endpoints `login.ts`/`logout.ts`: setean/limpian cookie vía `Astro.cookies`.
- `src/middleware.ts` — lee cookie, `auth.getSessionWithUser(hash)`, `locals.user = { id, email }`; 401/redirect igual que hoy.
- `src/env.d.ts` — `Locals.user` pasa a `{ id: string; email: string | null }`.

## 6. Reescritura de servicios y endpoints

- `modules/appointment/services/{create,list,get,update,request}.ts` y `modules/message/services/create.ts`: reciben el repositorio del puerto en vez de `SupabaseServerClient`; try/catch mapea errores lanzados a `{ ok: false, error }`. `request` sigue forzando `status: "pending"`.
- Endpoints: reemplazan `createSupabaseServerClient`/`createSupabaseAdminClient` por `getRepositories()`. Ya no existe la distinción server/admin client — todo el acceso es server-side con los mismos repos.

## 7. Seed del admin

- `scripts/seed-admin.js` reescrito: driver `mariadb` directo + `bcryptjs` (sin pasar por el client TS generado — el script sigue siendo node plano). Idempotente por `email` unique. Usa `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## 8. Config y limpieza

- `astro.config.mjs`: schema de env pasa a `DATABASE_URL` (`context: "server"`, `access: "secret"`).
- Borrar: `src/lib/supabase/`, `supabase/` completo.
- `SUPABASE_ROADMAP.md` → `docs/archive/SUPABASE_ROADMAP.md` (con nota de archivo al tope).
- Nuevo `DATABASE.md`: decisiones, estructura de la capa db, comandos, checklist de deploy (crear DB/user en cPanel, versión MySQL, `DATABASE_URL` en el setup Node, `prisma migrate deploy`).
- Actualizar `docs/DEPLOY.md` (env vars y pasos de DB) y CLAUDE.md (referencia a `DATABASE.md`).

## 9. Tests (Vitest)

- `vitest.config.ts` + script `test`.
- `src/lib/db/fakes/` — repos en memoria implementando los puertos (sirven a todos los tests).
- Tests de servicios: `request` fuerza `pending`; `update`/`get` devuelven `not_found`; `login` falla con password errónea/usuario inactivo y crea sesión al acertar; `logout` borra la sesión; `createMessage` feliz.

## 10. Verificación

- `yarn test` y `yarn build` en verde.
- Flujo manual con `db:up` + `seed:admin` + `yarn dev`: login/logout, CRUD de citas en `/admin`, `POST /api/appointments` y `POST /api/messages` públicos, middleware bloqueando `/admin` sin cookie.
