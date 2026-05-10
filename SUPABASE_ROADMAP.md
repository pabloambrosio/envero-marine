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
| `quiz_question` | Preguntas de un quiz. | `position int` ordena el quiz en el front (`ORDER BY position`). `type` es enum cerrado (`single_choice`/`multiple_choice`/`open_text`), `options text[]` lista las respuestas predefinidas, `allow_other bool` habilita el campo de respuesta abierta extra. CHECK cruzado fuerza la consistencia (open_text sin opciones, choice con ≥2). |
| `appointment` | Citas y solicitudes de cita. | `status pending/confirmed/cancelled/completed`. La "solicitud" es un appointment con `status='pending'`. `quiz_snapshot jsonb` guarda preguntas + respuestas inmutables al momento de pedir. |
| `message` | Formulario de contacto. | `handled_by` apunta al admin que respondió. |

Trigger `set_updated_at` aplicado a `app_user`, `quiz`, `quiz_question`, `appointment`.

## Decisiones tomadas

- **Tabla `app_user`** (no `user`), FK a `auth.users(id)`. Evita la palabra reservada y queda lista para Supabase Auth.
- **Quiz preguntas como tabla separada** (no jsonb dentro de `quiz`). Más limpio para reordenar/desactivar individualmente.
- **Tres tipos de pregunta cerrados** (`single_choice`, `multiple_choice`, `open_text`) en vez de un motor genérico. Las opciones viven en `options text[]` y un `allow_other bool` controla si la pregunta acepta una respuesta libre extra además de las opciones. Migrado desde `type text` libre + `config jsonb` ([`supabase/migrations/20260509200000_quiz_question_typed_options.sql`](supabase/migrations/20260509200000_quiz_question_typed_options.sql)).
- **Una sola tabla `appointment`** con `status`, en vez de tabla `appointment_request` aparte. La "solicitud" no es una entidad distinta.
- **`quiz_snapshot jsonb`** guarda preguntas + respuestas juntas, inmutable al momento de la solicitud.
- **Cloudflare adapter** para Astro (decidido, no implementado todavía). SSR solo en `/admin/*`; el sitio público sigue prerenderizado.
- **Auth solo para staff.** Clientes finales no se autentican; entran al quiz/contacto como anónimos.
- **Doble capa de defensa:** RLS en la DB + checks en endpoints. La `secret key` (service-role) bypassa RLS y vive solo del lado servidor.
- **Sesión en cookies HttpOnly** (cuando hagamos SSR), vía `@supabase/ssr`.
- **Validación con Zod v4** en todos los endpoints. El schema vive con el tipo del feature; el helper `validateBody` parsea + valida en una sola llamada y devuelve la `Response` 400 lista cuando falla.
- **Cliente service-role en `src/lib/supabase/admin.ts`** para operaciones que necesitan bypassear RLS desde el server (ej: crear `auth.users` + `app_user` en el mismo flujo). Server-only, jamás importar desde el browser. La sesión publishable del admin logueado **no** sirve para esto — `auth.admin.*` exige service-role.
- **Trigger `handle_new_user` descartado.** Crear usuarios pasa por el endpoint admin: el servicio `createUser` orquesta `auth.admin.createUser` + insert en `app_user` con rollback (delete del `auth.users`) si el segundo paso falla. Más explícito que un trigger oculto y mantiene el flujo en código revisable.

## Estructura de endpoints

Convención que sostenemos desde el primer endpoint (login). Cualquier endpoint nuevo se monta igual sin pensarlo dos veces.

### Tres capas, responsabilidades estrictas

1. **`src/pages/api/<...>.ts`** — endpoint. Solo flujo HTTP: valida body con Zod, compone el cliente Supabase, llama al servicio, mapea resultado a `Response`. Cero lógica de dominio.
2. **`src/modules/<dominio>/services/<feature>.ts`** — servicio. Recibe input ya validado y dependencias (cliente Supabase). Hace la operación y devuelve un union discriminado `{ ok: true, ... } | { ok: false, error }`. No conoce HTTP.
3. **`src/modules/<dominio>/types/<feature>.ts`** — schema Zod + tipo inferido + tipos de resultado. La forma de la entrada y la salida del feature, en un solo lugar.

### Helpers compartidos

- **`src/lib/http.ts`**:
  - `json(payload, status = 200)` — construye `Response` JSON.
  - `validateBody(request, schema)` — parsea body + corre `safeParse`. Devuelve `{ ok: true, data } | { ok: false, response }`. La `response` ya viene formateada (400 con `{ error: "invalid_json" | "invalid_request", issues }`).
- **`src/lib/supabase/server.ts`**: `createSupabaseServerClient({ request, cookies })` — cliente SSR bindeado a las cookies de la request actual. **Una instancia por request** (no cachear — los cookie handlers son per-request, mezclar sesiones entre usuarios sería un bug de seguridad).
- **`src/lib/supabase/admin.ts`**: `createSupabaseAdminClient()` — cliente service-role para operaciones que bypassean RLS (crear usuarios en `auth.users`, etc.). Sin cookies, sin sesión. Server-only.

### Endpoint canónico (referencia)

[`src/pages/api/admin/login.ts`](src/pages/api/admin/login.ts) es el patrón a copiar:

```ts
export const POST: APIRoute = async ({ request, cookies }) => {
  const validated = await validateBody(request, LoginSchema);
  if (!validated.ok) return validated.response;

  const supabase = createSupabaseServerClient({ request, cookies });
  const result = await login(validated.data, supabase);

  return result.ok
    ? json({ user: result.user })
    : json({ error: result.error }, 401);
};
```

Endpoints sin body (logout, etc.) saltean el `validateBody` y van directo a componer cliente + llamar servicio. Mismo patrón sin la validación.

### Schemas Zod

- Schema y tipo conviven en `types/<feature>.ts`: `LoginSchema` + `type LoginRequest = z.infer<typeof LoginSchema>`. El schema es la fuente de verdad, el tipo se infiere.
- Errores de validación devuelven `issues` con `path` + `message` por campo. Útil para mostrar errores inline en el front.
- En **Zod v4**, las validaciones de formato son top-level: `z.email()`, `z.url()`, `z.uuid()`. No usar `z.string().email()` (deprecado).

### Cookies y auth (cómo viajan al cliente)

`createSupabaseServerClient` registra callbacks `getAll`/`setAll` que delegan en `Astro.cookies`. Cuando un servicio llama `supabase.auth.signInWithPassword` o `supabase.auth.signOut`, el SDK de Supabase invoca esos callbacks y las cookies (`sb-<ref>-auth-token`) se serializan automáticamente como `Set-Cookie` en la `Response`. **No hay que tocar headers manualmente** — Astro maneja la serialización al devolver el handler.

### Middleware

[`src/middleware.ts`](src/middleware.ts) protege `/admin/*`, `/api/admin/*`, `/vendors/*`, `/api/vendors/*`. Excepciones explícitas: `/admin/login`, `/vendors/login`, endpoints `/api/.../login` y `/api/.../logout`.

- **`getUser()` y no `getSession()`** — hace network call a Supabase para validar que el token no esté revocado. Más seguro para área admin, ~50-150ms por request a zona protegida.
- **HTML → redirect** al `/login` del namespace correspondiente. **`/api/*` → 401 JSON.** El usuario autenticado queda en `Astro.locals.user` para downstream.
- El middleware **corre globalmente en invocación** pero **filtra por path** adentro. Visitantes a `/`, `/en`, etc. salen en `next()` inmediato sin tocar Supabase.
- **Segundo nivel de gating: `ADMIN_ONLY_PREFIXES`.** Después de validar sesión, si el path matchea un prefijo admin-only (hoy `/api/admin/users`), el middleware lee `app_user` por `id` y exige `role = 'admin' AND active = true`. Si no, `/api/*` → 403 JSON, HTML → redirect login. Una query extra a `app_user` solo cuando el path lo requiere — para sesión sola (área admin general) no se paga ese costo.

### Páginas estáticas vs SSR

- **`prerender = true`** en páginas públicas (home, secciones de marketing). Se buildean a HTML estático y las sirve la CDN de Cloudflare directo desde el edge — el Worker (donde vive el middleware) ni se entera.
- **SSR (default)** en `/admin/*`, `/vendors/*`, `/api/*`. Cada request invoca el Worker, el middleware corre, los handlers tienen `Astro.locals.user`.
- **Nunca prerender en páginas protegidas** — el middleware en build hornearía un redirect en el HTML estático. La regla se cae sola: páginas protegidas dependen del usuario actual, son SSR por naturaleza.

## Roadmap

- [x] CLI instalado como devDep (`yarn supabase`)
- [x] `supabase init` + `project_id = "envero-marine"`
- [x] Migración inicial con 6 tablas, índices y trigger `set_updated_at`
- [x] Cliente browser en [`src/lib/supabase/client.ts`](src/lib/supabase/client.ts)
- [x] Auth config: signup cerrado, sin OAuth/SMS/MFA, password 8+ (loose para dev)
- [x] Seed admin idempotente ([`scripts/seed-admin.js`](scripts/seed-admin.js))
- [x] **RLS habilitado en las 6 tablas** + policies por rol (`anon`, `authenticated`, admin, vendor) ([`supabase/migrations/20260507203452_rls_policies.sql`](supabase/migrations/20260507203452_rls_policies.sql))
- [x] Adapter `@astrojs/cloudflare` + `output: 'server'` ([astro.config.mjs](astro.config.mjs))
- [x] `prerender = true` en homes públicos ([`src/pages/index.astro`](src/pages/index.astro), [`src/pages/en/index.astro`](src/pages/en/index.astro)) — agregar al resto de páginas marketing cuando se sumen
- [x] Cliente server-side ([`src/lib/supabase/server.ts`](src/lib/supabase/server.ts)) con `@supabase/ssr` + cookies de Astro
- [x] Cliente service-role server-only ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts))
- [x] Middleware de Astro ([`src/middleware.ts`](src/middleware.ts)) que protege `/admin/*`, `/api/admin/*`, `/vendors/*`, `/api/vendors/*` + admin-only gate sobre `/api/admin/users`, `/api/admin/quizzes`, `/api/admin/appointments`, `/api/admin/clients`
- [x] Endpoint `POST /api/admin/login` con Zod validation ([`src/pages/api/admin/login.ts`](src/pages/api/admin/login.ts))
- [x] Endpoint `POST /api/admin/logout` ([`src/pages/api/admin/logout.ts`](src/pages/api/admin/logout.ts))
- [x] CRUD admin de staff: `/api/admin/users` (GET list, POST create) + `/api/admin/users/[id]` (GET, PATCH, DELETE soft via `active=false`). Módulo en [`src/modules/users/`](src/modules/users/) con types Zod + 5 servicios separados por operación.
- [x] CRUD admin de quizzes: `/api/admin/quizzes` (GET list, POST create) + `/api/admin/quizzes/[id]` (GET, PATCH, DELETE soft). Módulo en [`src/modules/quiz/`](src/modules/quiz/).
- [x] CRUD admin de preguntas: `/api/admin/quizzes/[id]/questions` (GET list, POST create) + `/api/admin/quizzes/[id]/questions/[qid]` (GET, PATCH, DELETE soft) + `PATCH /reorder` atómico vía RPC plpgsql. Tipos cerrados a 3: `single_choice`, `multiple_choice`, `open_text`, con `options[]` y `allow_other` como columnas de primera clase.
- [x] CRUD admin de citas: `/api/admin/appointments` (GET list, POST create) + `/api/admin/appointments/[id]` (GET, PATCH). No hay DELETE — cancelar = `PATCH { status: "cancelled" }`. Módulo en [`src/modules/appointment/`](src/modules/appointment/).
- [x] Módulo `client` (lead/CRM): `/api/admin/clients` (POST create) — tabla deliberadamente laxa, sin uniques, indexada en `email`/`phone`/`company_name`/`name`/`created_at`. Anon insert habilitado vía RLS para el flujo público anónimo (futuro).
- [x] Frontend admin completo bajo `/admin/*`: login + dashboard read-only con conteos, CRUDs de usuarios/quizzes/preguntas (drag&drop reorder con HTML5 nativo + rollback optimista)/citas (alta manual con orquestación cliente→cita en dos llamadas). Layout con sidebar persistente. Helpers en [`src/admin/`](src/admin/) (`guard.ts`, `api.ts`, `format.ts`). Estilos compartidos en [`src/styles/admin.css`](src/styles/admin.css).
- [ ] Tipos TS generados (`yarn supabase gen types typescript --local > src/lib/supabase/database.types.ts`)
- [ ] Endpoint público `POST /api/appointments` (anon) que orqueste cliente + cita para el flujo del quiz público
- [ ] Endpoint `GET /api/admin/clients/[id]` y/o list, si en algún momento queremos navegar leads desde el admin
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
