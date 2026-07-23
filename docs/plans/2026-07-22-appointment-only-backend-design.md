# Reducir Supabase a solo appointments — diseño

Fecha: 2026-07-22
Estado: aprobado, pendiente de implementación

## Objetivo

Achicar el backend al mínimo necesario para lanzar a producción lo antes posible: la única función del sitio va a ser (1) guardar citas desde el público y (2) que un admin único pueda consultarlas. Se tira todo lo demás: `client`, `app_user`, `quiz`/`quiz_question`, `message`.

## Por qué

El schema actual quedó sobre-diseñado para un alcance (staff con roles, CRM de leads, quiz configurable) que no es el objetivo real de esta primera versión en producción. Simplificar ahora es barato: no hay producción real con datos todavía (solo el stack local y un demo descartable en Supabase cloud), así que se puede reescribir el schema desde cero en vez de acumular migraciones incrementales sobre un diseño que se va a abandonar.

## Alcance de esta ronda

Incluye: schema de DB, RLS, middleware/auth, y el código de servidor que queda huérfano al tirar las tablas (endpoints, módulos, páginas admin, seed script).

No incluye: wiring del wizard público (`/contact`) a un formulario real con nombre/email/teléfono y submit al backend. Hoy el wizard solo tiene selector de fecha/hora, sin campos de contacto ni botón de envío — eso queda para una ronda aparte.

## Schema

Se tiran completas: `client`, `app_user`, `quiz`, `quiz_question`, `message`. Con ellas se van sus dependencias: RPC `reorder_questions`, índices de `client`, y los `CHECK`/índice único de `appointment_slot_rules`.

`appointment` queda como única tabla del schema reducido:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `uuid` pk default `gen_random_uuid()` | |
| `name` | `text not null` | reemplaza a `client.name` |
| `email` | `text not null` | antes opcional-junto-a-phone; ahora obligatorio |
| `phone` | `text not null` | ídem |
| `appointment_date` | `timestamptz not null` | sin `CHECK` de horario laboral en DB |
| `status` | `text not null default 'pending'`, `check (status in ('pending','confirmed','cancelled'))` | se descarta `completed` |
| `notes` | `text` | |
| `created_at` / `updated_at` | `timestamptz not null default now()` | trigger `set_updated_at` se mantiene |

Sin `client_id`, `vendor_id`, `quiz_id`, `quiz_snapshot`. Sin índice anti-doble-booking (`appointment_one_real_per_slot`). Índices en `status` y `appointment_date` para el listado del admin.

**Reglas de horario (Mon-Fri 08:00–17:00, `America/Merida`, hora en punto):** se mantienen como validación de UI únicamente (bloqueo visual en el selector de slots). No hay `CHECK` en DB ni validación de servidor que las fuerce por ahora — el objetivo es observar qué piden los usuarios antes de volver a poner reglas duras.

## Auth / Middleware

Sin `app_user`: el admin es un único usuario fijo en `auth.users`, seedeado vía `scripts/seed-admin.js`. No hay roles, no hay distinción admin/vendor.

En [`src/middleware.ts`](../../src/middleware.ts):
- Se borran `/vendors` y `/api/vendors` de `PROTECTED_PREFIXES`/`PUBLIC_EXCEPTIONS` — nunca tuvieron páginas reales, eran namespace muerto para un rol que ya no existe.
- Se borra `ADMIN_ONLY_PREFIXES`/`requiresAdmin()` — consultaba `app_user.role`, que ya no existe. Cualquier sesión válida (`getUser()` exitoso) es, por definición, el admin.
- Prefijos protegidos quedan: `/admin`, `/api/admin`.

## RLS

`appointment` con RLS habilitado:
- `anon`: solo `INSERT`, con `check (status = 'pending')` — el público no puede crear citas ya confirmadas o canceladas.
- `authenticated`: `SELECT` + `UPDATE` — el admin único ve y gestiona todo, sin distinción de rol.

El endpoint público (`POST /api/appointments`) sigue usando el cliente service-role (`createSupabaseAdminClient()`) para el insert, por el mismo motivo que hoy: RLS bloquea el `SELECT` implícito de `.insert().select()` para `anon`, y no queremos abrir lectura pública de citas.

## Código a eliminar

- `src/modules/users/`, `src/modules/quiz/`, `src/modules/client/`
- `src/pages/api/admin/users*`, `src/pages/api/admin/quizzes*`, `src/pages/api/admin/clients*`
- `src/pages/admin/users.astro` (+`[id]`), `src/pages/admin/quizzes.astro` (+`[id]`, preguntas)

## Código a ajustar

- `src/modules/appointment/types/appointment.ts` y `types/request.ts` — sacar `client_id`/`vendor_id`/`quiz_id`/`quiz_snapshot`, agregar `name`/`email`/`phone` como obligatorios (ya no "al menos uno de email o phone").
- `src/modules/appointment/services/request.ts` — hoy orquesta `client` + `appointment` en dos pasos; pasa a ser un solo insert directo en `appointment` con los datos de contacto.
- `src/modules/appointment/services/create.ts`, `get.ts`, `list.ts`, `update.ts` — ajuste de tipos al nuevo shape de `AppAppointment`.
- `src/pages/admin/appointments*.astro` — mostrar `name`/`email`/`phone` directo en vez de datos vía `client`.
- `scripts/seed-admin.js` — hoy inserta en `auth.users` y en `app_user`; se recorta a solo crear el usuario en `auth.users`.
- `supabase/schema.dbml` — regenerar contra el schema reducido.

## No se toca

El wizard público en `src/pages/contact/index.astro` + `src/components/appointment/` sigue siendo solo selector visual de fecha/hora, sin campos de contacto ni submit al backend. Queda fuera de esta ronda (ver "Alcance").

## Migraciones

**Squash.** Se borran las 6 migraciones actuales (`20260507173214_initial_schema.sql`, `20260507203452_rls_policies.sql`, `20260508162425_reorder_questions_rpc.sql`, `20260509120000_client_indexes.sql`, `20260509200000_quiz_question_typed_options.sql`, `20260513193000_appointment_slot_rules.sql`) y se reemplazan por una única migración nueva con el schema reducido de arriba (tabla + trigger + RLS).

`yarn supabase db reset` reconstruye el stack local desde cero. El demo descartable en Supabase cloud (`envero-marine-demo`, sa-east-1) queda desactualizado — no se sincroniza; si sigue en pie y hace falta, se resetea aparte cuando corresponda.
