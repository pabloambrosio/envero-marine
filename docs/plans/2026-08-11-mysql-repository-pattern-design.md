# Migración a MySQL con patrón repositorio (HostGator)

Fecha: 2026-08-11 · Rama: `feat/node-adapter-hostgator`

## Contexto y objetivo

El cliente tiene HostGator plan Business (Node + MySQL). Esta rama ya migró el adapter de Astro a Node standalone; ahora migra la capa de datos de Supabase (Postgres + Auth) a MySQL. Para saldar la deuda técnica de una vez, el acceso a datos queda detrás del **patrón repositorio**: si en el futuro se vuelve a Supabase o se cambia de base, el cambio queda centralizado en un punto.

Alcance: el schema activo post-squash (`appointment`, `message`) más las tablas nuevas de auth propia (`user`, `session`). `quiz`/`client` quedaron fuera del squash de Supabase y siguen fuera.

## Decisiones

| Tema | Decisión |
|---|---|
| ORM | **Prisma 7** sin engines Rust: generator `prisma-client` con `engineType = "client"` + driver adapter `@prisma/adapter-mariadb` (JS puro, compatible con todo MySQL). Cero binarios nativos — criterio clave en hosting compartido. |
| Arquitectura | **Puertos + adaptadores.** Interfaces TS por agregado en `src/lib/db/ports/`, implementación Prisma en `src/lib/db/prisma/`, factory único en `src/lib/db/index.ts`. |
| Auth | **Propia en MySQL.** Se elimina Supabase Auth por completo. |
| Tabla de usuarios | `user` (en MySQL no es palabra reservada problemática). |
| IDs | UUID generado en app (`String @id @default(uuid())`, char(36)). Mantiene `id: string` en los tipos de dominio; endpoints y frontend admin no cambian. |
| Tipos de columnas | `appointment_date DATETIME` real y `status` como enum de Prisma (ENUM nativo MySQL). El mapper convierte `Date` → ISO string en el borde. |
| `updated_at` | `@updatedAt` de Prisma reemplaza el trigger `set_updated_at`. |
| Supabase en esta rama | Se borra todo: deps `@supabase/*` y `supabase`, `src/lib/supabase/`, directorio `supabase/`. La historia queda en git. |
| Testing | **Vitest, unitarios de servicios con repos fake en memoria.** Sin tests de integración contra DB por ahora. |
| Dev DB | **Docker `mysql:8`** vía `docker-compose.yml` en el repo, flujo local-first como con Supabase. |
| RLS | Desaparece sin reemplazo. Aceptable: todo acceso a la DB es server-side (middleware + servicios); no existe cliente browser hacia la DB. |

## Arquitectura de la capa de datos

```
src/lib/db/
  ports/
    appointment-repository.ts   # interface + tipos de dominio del agregado
    message-repository.ts
    auth-repository.ts          # users + sessions
  prisma/
    client.ts                   # singleton PrismaClient + PrismaMariaDb adapter
    appointment-repository.ts
    message-repository.ts
    auth-repository.ts
    mappers.ts                  # fila Prisma → tipo de dominio (Date → ISO string)
  index.ts                      # getRepositories(): { appointments, messages, auth }
```

Reglas del contrato:

- **Los puertos no importan nada de Prisma.** Exponen los tipos de dominio existentes (`AppAppointment`, `AppMessage`; fechas como string ISO, igual que hoy). Prisma queda 100 % encapsulado detrás del adapter.
- **Los servicios de `src/modules/`** cambian su dependencia: de `SupabaseServerClient` a la interfaz del puerto. Su contrato de salida (`{ ok: true, ... } | { ok: false, error }`) no cambia → los endpoints solo cambian qué inyectan.
- **Errores:** los repositorios lanzan; el servicio hace try/catch y mapea al union `{ ok: false, error }`.
- **Cambiar de DB** = implementar los puertos en una carpeta hermana y recablear `index.ts`.

Métodos por puerto:

- `AppointmentRepository`: `create`, `list`, `getById`, `update`. (La solicitud pública es `create` con `status: 'pending'`.)
- `MessageRepository`: `create`.
- `AuthRepository`: `findUserByEmail`, `createSession`, `getSessionWithUser`, `deleteSession`, `deleteExpiredSessions`.

## Schema Prisma (MySQL)

- **`appointment`** — `id` uuid app-side, `name`, `email?`, `phone`, `company_name?`, `appointment_date DATETIME`, `status ENUM(pending|confirmed|cancelled)`, `notes?`, `created_at`, `updated_at @updatedAt`.
- **`message`** — `id`, `name`, `email`, `phone?`, `company_name?`, `message TEXT`, `created_at`.
- **`user`** — `id`, `email` unique, `password_hash`, `active bool`, `created_at`.
- **`session`** — `id` (SHA-256 del token, nunca el token en claro), `user_id` FK → `user`, `expires_at`, `created_at`.

Migraciones con `prisma migrate`: SQL versionado en `prisma/migrations/` (mismo espíritu que `supabase/migrations/`). Config en `prisma.config.ts` con `env("DATABASE_URL")`.

## Auth propia

- **Passwords:** `bcryptjs` (JS puro, sin módulos nativos), cost 12.
- **Sesiones opacas:** token aleatorio de 32 bytes al loguear; en `session` se guarda su SHA-256. Cookie `session` HttpOnly + `Secure` + `SameSite=Lax`, 30 días.
- **Login:** `findUserByEmail` → `bcrypt.compare` → `createSession` → cookie vía `Astro.cookies`. De paso borra sesiones expiradas del usuario (limpieza sin cron). Mismo contrato de resultado → endpoint sin cambios.
- **Logout:** borra la sesión en DB y limpia la cookie.
- **Middleware:** reemplaza `supabase.auth.getUser()` (network call de 50–150 ms) por una query local `getSessionWithUser(hash)`. `locals.user` mantiene su forma (`id`, `email`).
- **Seed:** `scripts/seed-admin.js` reescrito contra Prisma, mismo `.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`), idempotente.

## Entorno dev y deploy

- `docker-compose.yml` con `mysql:8`; `DATABASE_URL` en `.env`.
- Scripts yarn: `db:up`/`db:down`, `db:migrate` (`prisma migrate dev`), `db:studio`, `seed:admin`.
- Prod: `prisma migrate deploy` contra la DB de HostGator (SSH del plan Business o Remote MySQL). `DATABASE_URL` como env var del setup Node en cPanel, declarada `access: "secret"` en `env.schema`.
- Checklist pre-deploy: verificar versión de MySQL en cPanel (5.7+ mínimo para Prisma), crear DB + user en cPanel, password fuerte del admin, `Secure` activo en la cookie (requiere HTTPS).

## Limpieza

Se van: `@supabase/ssr`, `@supabase/supabase-js`, devDep `supabase`, `src/lib/supabase/`, `supabase/`, vars `SUPABASE_*` de `env.schema` y `.env`. `SUPABASE_ROADMAP.md` se archiva; lo reemplaza `DATABASE.md` con el mismo rol (decisiones, comandos, checklist). Se actualiza la referencia en CLAUDE.md (local).

## Testing

- **Vitest** con tests unitarios de los servicios de `src/modules/`, inyectando repositorios fake en memoria que implementan los puertos.
- Los repos Prisma se verifican manualmente contra el MySQL de docker (build + recorrido de flujos: login/logout, CRUD de citas en `/admin`, form de contacto y wizard públicos).
