# Supabase roadmap

Fuente de verdad de por dónde vamos con Supabase en este proyecto. Si entrás a tocar cualquier cosa de auth, schema, migraciones, RLS, cliente JS, adapter SSR o seeds, leelo antes — te ahorra preguntar lo mismo dos veces y romper decisiones que ya tomamos.

## Cómo trabajamos

- **Todo en `main`.** No abrimos branches por feature acá. Si algo es grande, lo partimos en commits pequeños sobre `main`.
- **Local-first.** El stack corre en Docker (`yarn supabase start`). Antes de pensar en cloud, todo se prueba contra el stack local.
- **El cliente final no toca Supabase.** La empresa que pagó esto no entra a Studio, no maneja env vars, no recibe access keys. Toda operación administrativa pasa por endpoints que nosotros mantenemos.

## Direcciones del stack local

| Servicio | URL |
|---|---|
| Studio | http://127.0.0.1:54323 |
| API (REST + Auth + Storage) | http://127.0.0.1:54321 |
| Inbucket (mails capturados) | http://127.0.0.1:54324 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

`yarn supabase status` te lista todo y las keys actuales. Los contenedores se llaman `supabase_*_envero-marine` (`project_id` en `supabase/config.toml`).

## Schema actual

Seis tablas en `public`. Migración inicial: [`supabase/migrations/20260507173214_initial_schema.sql`](supabase/migrations/20260507173214_initial_schema.sql).

| Tabla | Propósito | Notas |
|---|---|---|
| `app_user` | Staff interno (admin/vendor). | PK = FK a `auth.users(id)` con `on delete cascade`. `role` con check (`admin`/`vendor`). Renombrada de `user` por palabra reservada. |
| `client` | Leads / visitantes. Sin auth. | Datos del form de contacto / quiz. |
| `quiz` | Plantillas de quiz. | Metadata + versión + `active`. Preguntas viven aparte. |
| `quiz_question` | Preguntas de un quiz. | `position int` ordena el quiz en el front (`ORDER BY position`). Tiene `type`, `config jsonb`, `required`, `active`. |
| `appointment` | Citas y solicitudes de cita. | `status pending/confirmed/cancelled/completed`. La "solicitud" es un appointment con `status='pending'`. `quiz_snapshot jsonb` guarda preguntas + respuestas inmutables al momento de pedir. |
| `message` | Formulario de contacto. | `handled_by` apunta al admin que respondió. |

Trigger `set_updated_at` aplicado a `app_user`, `quiz`, `quiz_question`, `appointment`.

## Decisiones tomadas

- **Tabla `app_user`** (no `user`), FK a `auth.users(id)`. Evita la palabra reservada y queda lista para Supabase Auth.
- **Quiz preguntas como tabla separada** (no jsonb dentro de `quiz`). Más limpio para reordenar/desactivar individualmente.
- **Una sola tabla `appointment`** con `status`, en vez de tabla `appointment_request` aparte. La "solicitud" no es una entidad distinta.
- **`quiz_snapshot jsonb`** guarda preguntas + respuestas juntas, inmutable al momento de la solicitud.
- **Cloudflare adapter** para Astro (decidido, no implementado todavía). SSR solo en `/admin/*`; el sitio público sigue prerenderizado.
- **Auth solo para staff.** Clientes finales no se autentican; entran al quiz/contacto como anónimos.
- **Doble capa de defensa:** RLS en la DB + checks en endpoints. La `secret key` (service-role) bypassa RLS y vive solo del lado servidor.
- **Sesión en cookies HttpOnly** (cuando hagamos SSR), vía `@supabase/ssr`.

## Roadmap

- [x] CLI instalado como devDep (`yarn supabase`)
- [x] `supabase init` + `project_id = "envero-marine"`
- [x] Migración inicial con 6 tablas, índices y trigger `set_updated_at`
- [x] Cliente browser en [`src/lib/supabase/client.ts`](src/lib/supabase/client.ts)
- [x] Auth config: signup cerrado, sin OAuth/SMS/MFA, password 8+ (loose para dev)
- [x] Seed admin idempotente ([`scripts/seed-admin.js`](scripts/seed-admin.js))
- [ ] **RLS habilitado en las 6 tablas** + policies por rol (`anon`, `authenticated`, admin, vendor)
- [ ] Trigger `handle_new_user` en `auth.users` para auto-crear fila en `app_user` (decidir: ¿lo queremos o lo dejamos manual desde el endpoint de creación de vendor?)
- [ ] Adapter `@astrojs/cloudflare` + `output: 'server'` con `prerender = true` por defecto en páginas públicas
- [ ] Cliente server-side (`src/lib/supabase/server.ts`) con `@supabase/ssr` + cookies de Astro
- [ ] Middleware de Astro (`src/middleware.ts`) que protege `/admin/*`
- [ ] Página `/admin/login`
- [ ] Endpoint admin para crear vendors (valida caller con sesión, usa service-role internamente)
- [ ] Tipos TS generados (`yarn supabase gen types typescript --local > src/lib/supabase/database.types.ts`)
- [ ] Env vars de prod en Cloudflare Workers Secrets (URL, publishable, secret) — jamás commit

## Pre-prod checklist

Antes de subir a producción, **revisar uno por uno**:

- [ ] `minimum_password_length` en `supabase/config.toml`: 8 → 12
- [ ] `password_requirements`: `""` → `"lower_upper_letters_digits"`
- [ ] Cambiar password del admin dev (jamás `12345678` en prod)
- [ ] `site_url` en `config.toml`: `http://127.0.0.1:4321` → URL de prod
- [ ] `additional_redirect_urls`: agregar URL de prod
- [ ] `[auth.email.smtp]` configurado con SMTP real (sino los password resets no llegan)
- [ ] Considerar `enable_confirmations = true` en `[auth.email]`
- [ ] Considerar `secure_password_change = true`
- [ ] Considerar MFA TOTP para admins (`[auth.mfa.totp]`)
- [ ] Verificar que **todas** las tablas tengan `enable row level security` (sin policy explícita = sin acceso = seguro por defecto)
- [ ] `SUPABASE_SECRET_KEY` solo como secret en Cloudflare Workers, nunca en bundle del cliente
- [ ] `.env*` en `.gitignore` (ya está) — verificar que no se filtre

## Credenciales dev

```
admin@local.test / 12345678
```

Cualquier email `*@local.test` funciona — Inbucket (http://127.0.0.1:54324) atrapa los mails locales.

## Comandos útiles

```bash
# Stack local
yarn supabase start
yarn supabase stop
yarn supabase status

# DB
yarn supabase db reset                          # tira DB y re-aplica todas las migraciones
yarn supabase migration new <nombre>            # nuevo archivo de migración con timestamp

# Seed
yarn seed:admin                                 # crea admin de .env (idempotente)

# Tipos TS (a generar cuando empecemos a consumir)
yarn supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Query rápida sin psql instalado en el host
docker exec supabase_db_envero-marine psql -U postgres -d postgres -c "SELECT ..."

# Borrar admin para iterar (las dos tablas — la cascada solo va auth.users → app_user, no al revés vía SQL directo)
docker exec supabase_db_envero-marine psql -U postgres -d postgres -c \
  "delete from public.app_user where email='admin@local.test'; \
   delete from auth.users where email='admin@local.test';"
```
