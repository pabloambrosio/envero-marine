# Base de datos: MySQL + Prisma + patrón repositorio

Fuente de verdad de la capa de datos. Si entrás a tocar schema, migraciones, auth, repositorios o seeds, leelo antes. Reemplaza a `SUPABASE_ROADMAP.md` (archivado en [`docs/archive/`](docs/archive/SUPABASE_ROADMAP.md)) desde la migración a HostGator.

Diseño y plan de la migración: [`docs/plans/2026-08-11-mysql-repository-pattern-design.md`](docs/plans/2026-08-11-mysql-repository-pattern-design.md).

## Cómo trabajamos

- **Local-first.** MySQL 8 corre en Docker (`yarn db:up`). Todo se prueba local antes de tocar la base de HostGator.
- **El cliente final no toca la DB.** Toda operación pasa por endpoints que nosotros mantenemos; no hay acceso browser→DB de ningún tipo.
- **Los servicios no conocen la base.** Hablan con los puertos de `src/lib/db/ports/`; Prisma es un detalle del adapter.

## Arquitectura: puertos y adaptadores

```
src/lib/db/
  ports/          # interfaces + tipos de dominio. Cero imports de Prisma.
    appointment-repository.ts
    message-repository.ts
    auth-repository.ts
    user-repository.ts
  prisma/         # implementación concreta (Prisma 7 + @prisma/adapter-mariadb)
    client.ts     # singleton PrismaClient (pool compartido por proceso)
    mappers.ts    # fila Prisma → tipo de dominio (Date → ISO string, camelCase → snake_case)
    *-repository.ts
  index.ts        # getRepositories() — único punto de cableado
```

Reglas que sostienen el patrón:

- Los **puertos** definen los tipos de dominio (`AppAppointment`, `AppMessage`, `AuthUser`) con la misma forma que ya hablaba la API: snake_case, fechas ISO string. Los módulos de `src/modules/*/types/` los re-exportan.
- Los **servicios** reciben el puerto como dependencia, hacen try/catch y devuelven el union `{ ok: true, ... } | { ok: false, error }`. Los endpoints inyectan `getRepositories().<agregado>`.
- Los repositorios **lanzan** en errores de infraestructura y devuelven `null` para "no existe" — el servicio decide qué es `not_found`.
- **Cambiar de base** (volver a Supabase, lo que sea) = implementar los puertos en una carpeta hermana de `prisma/` y recablear `src/lib/db/index.ts`. Nada más se toca.

## Schema

Prisma es la fuente de verdad ([`prisma/schema.prisma`](prisma/schema.prisma)); las migraciones SQL versionadas viven en `prisma/migrations/`.

| Tabla | Propósito | Notas |
|---|---|---|
| `appointment` | Citas y solicitudes. | `status ENUM(pending/confirmed/cancelled)`; la "solicitud" es un appointment `pending`. `updated_at` lo mantiene `@updatedAt` de Prisma (ya no hay trigger). |
| `message` | Formulario de contacto del home. | Solo insert desde el endpoint público; falta panel para leerlos. |
| `user` | Staff que entra a `/admin`. | `email` unique, `name`, `password_hash` bcrypt (cost 12), `role ENUM(admin/staff)`, `active` para soft-disable (la única forma de baja: no hay delete). |
| `session` | Sesiones del panel. | `id` = SHA-256 hex del token de la cookie. FK a `user` con cascade. |

Decisiones:

- **IDs**: UUID generado en app (`char(36)`) — mantiene `id: string` en todo el dominio, los IDs no son adivinables.
- **Prisma 7 sin engines Rust**: generator `prisma-client` + `@prisma/adapter-mariadb` (driver JS puro). Cero binarios nativos en `dependencies`, a propósito: es lo que hace viable el hosting compartido.
- **El client generado** va a `src/generated/` (gitignored); lo regenera `postinstall` en dev. En prod no hace falta: viaja bundleado dentro de `dist/server/`.
- **RLS no existe en MySQL** y no se reemplaza: la defensa es middleware + servicios, y todo acceso es server-side.

## Auth propia

Supabase Auth se fue; el flujo completo vive en el repo:

- **Login** ([`src/modules/auth/services/login.ts`](src/modules/auth/services/login.ts)): busca `user` activo por email, `bcrypt.compare`, borra sesiones vencidas del usuario (limpieza sin cron), crea sesión nueva. El endpoint arma la cookie.
- **Sesiones opacas** ([`src/lib/session.ts`](src/lib/session.ts)): token de 32 bytes random en la cookie `session` (HttpOnly, `Secure` en prod, `SameSite=Lax`, 30 días); en la DB solo el SHA-256. Un dump de la base no regala sesiones.
- **Middleware** ([`src/middleware.ts`](src/middleware.ts)): protege `/admin/*` y `/api/admin/*` con una query local a `session` (antes era un network call a Supabase de 50–150 ms). `locals.user = { id, email }`.
- **Errores de login indistinguibles**: "no existe", "inactivo" y "password mal" devuelven el mismo `invalid_credentials`.
- **No hay reset de password por email.** Otro admin puede resetearla desde `/admin/users/<id>/edit`; si no queda ningún admin con acceso: `yarn seed:admin` con otro email, o UPDATE del hash a mano.
- **Roles** (`user.role`): `admin` gestiona usuarios (`/admin/users`, CRUD en `src/modules/user/`); `staff` usa el resto del panel y edita su perfil en `/admin/profile` (`/api/admin/me`). El enforcement vive en el middleware (prefijos `/admin/users` y `/api/admin/users`), no endpoint por endpoint. Anti-lockout: un admin no puede desactivarse ni sacarse el rol a sí mismo, y como la baja es solo `active = false`, siempre queda al menos un admin activo.

## Entorno dev

```bash
yarn db:up          # MySQL 8 en Docker (puerto 3310 del host)
yarn db:migrate     # prisma migrate dev — aplica/crea migraciones
yarn seed:admin     # crea el admin de .env (idempotente)
yarn db:studio      # Prisma Studio
yarn db:down        # apaga el contenedor
yarn test           # Vitest — servicios contra repos fake en memoria
```

`.env` local: `DATABASE_URL=mysql://envero:envero@127.0.0.1:3310/envero_marine` + `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

El usuario `envero` del contenedor tiene privilegios globales ([`docker/mysql-init.sql`](docker/mysql-init.sql)) porque `migrate dev` necesita crear una shadow database. Solo aplica al Docker local; en prod se usa `migrate deploy`, que no la necesita.

Query rápida sin cliente MySQL en el host:

```bash
docker exec envero-marine-mysql mysql -uenvero -penvero envero_marine -e "SELECT ..."
```

## Tests

- **Unitarios de servicios** con Vitest, inyectando los fakes en memoria de `src/lib/db/fakes/` (implementan los mismos puertos que Prisma).
- Los repositorios Prisma se verifican manualmente contra el Docker local (no hay tests de integración por ahora).

## Checklist de deploy

Antes de subir a producción, uno por uno:

- [ ] Verificar la versión de MySQL en cPanel (Prisma pide 5.7+; ideal 8.x como el Docker local)
- [ ] Crear base + usuario en cPanel → MySQL Databases, privilegios completos sobre esa base
- [ ] `DATABASE_URL` **solo** como variable de entorno de la app Node en cPanel — jamás commit
- [ ] `yarn db:deploy` (`prisma migrate deploy`) contra la base de prod
- [ ] Seed del admin con password fuerte (jamás `12345678` en prod)
- [ ] HTTPS activo antes de usar el panel — la cookie de sesión es `Secure` en prod y sin TLS no viaja
- [ ] `.env*` en `.gitignore` (ya está) — verificar que no se filtre

## Credenciales dev

```
admin@local.test / 12345678
```
