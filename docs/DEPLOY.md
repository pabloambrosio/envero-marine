# Deploy: qué es y cómo se hace en este proyecto

Guía para entender el despliegue de punta a punta, no solo copiar comandos. Está escrita asumiendo que nunca hiciste uno.

Si buscás la referencia de Supabase (schema, migraciones, RLS), esa vive en [`SUPABASE_ROADMAP.md`](../SUPABASE_ROADMAP.md). Esto es lo otro: cómo el código de tu máquina termina siendo un sitio que responde en un dominio real.

> **El destino es HostGator (plan Business, con Node).** El proyecto estuvo desplegado antes en Cloudflare Workers; esa etapa quedó atrás y el adapter se cambió a `@astrojs/node`. Si encontrás referencias a Workers, KV o `wrangler` en algún lado, son restos viejos.

---

## 1. Qué significa "desplegar" acá

Un deploy es tomar el código fuente, convertirlo en algo que una computadora ajena pueda ejecutar, y dejarlo colgado de una dirección pública. Nada más.

Este sitio tiene **tres piezas**, y cada una se administra por separado:

| Pieza | Qué es | Dónde vive |
|---|---|---|
| **La app Node** | Un proceso de Node que sirve todo: las páginas públicas ya pre-generadas *y* las rutas que necesitan servidor (`/admin/*`, `/api/*`). Es quien habla con Supabase. | HostGator (cPanel → Setup Node.js App) |
| **Base de datos + auth** | Las tablas `appointment` y `message`, y el usuario admin que entra al panel. | Supabase (Postgres gestionado, región `sa-east-1`) |
| **Dominio** | El nombre que la gente escribe. | HostGator (registrador + DNS) |

Con el adapter de Node en modo `standalone` **no hay separación entre "sitio estático" y "servidor"**: el mismo proceso sirve los archivos de `dist/client/` y ejecuta el código de `dist/server/`. Eso simplifica bastante respecto del esquema anterior — una sola cosa que desplegar, un solo lugar donde mirar si algo falla.

Lo que sigue igual es el `prerender = true` de cada página pública: esas se generan en el build y se sirven como HTML fijo, sin tocar la base. Solo el panel y las APIs se renderizan por request.

---

## 2. El mapa mental: build → subir → arrancar

```
   tu máquina                       HostGator                      Supabase
   ──────────                       ─────────                      ────────

   src/
    │
    │  yarn build
    ▼
   dist/
    ├── client/   ─┐
    └── server/   ─┘── subir ──►  proceso Node ──── HTTPS ────►  Postgres + Auth
                                   (Passenger)
                                        ▲
                                        │
                                   dominio.com
                                  (DNS de HostGator)
```

Tres verbos, en este orden:

1. **Build** — `yarn build` compila el proyecto y escupe `dist/`. No toca internet, no publica nada. Podés correrlo mil veces sin consecuencias.
2. **Subir + arrancar** — copiás `dist/` al servidor y le decís a cPanel que levante el proceso. Esto **sí** es visible al instante.
3. **DNS** — apuntar el dominio a la app. Se hace una sola vez, no en cada deploy.

La confusión típica del primer deploy es creer que son un solo paso. No lo son: podés buildear hoy y subir mañana, y podés subir cien veces sin volver a tocar el DNS.

---

## 3. Estado actual

El código ya está listo para Node. Lo que queda pendiente antes de considerar esto "en producción":

1. **Nunca se desplegó a HostGator todavía.** Los pasos de la sección 4 están sin ejecutar por primera vez.
2. **El checklist de pre-prod de Supabase nunca se aplicó** — reglas de password, `site_url`, SMTP, RLS verificada. Está en [`SUPABASE_ROADMAP.md`](../SUPABASE_ROADMAP.md#pre-prod-checklist).
3. **`site` en [`astro.config.mjs`](../astro.config.mjs) todavía apunta al `.workers.dev` viejo.** Ese valor genera las URLs canónicas y los previews de Open Graph. Con el dominio real hay que cambiarlo, o los previews sociales van a seguir apuntando a un sitio que ya no es el nuestro.
4. **El Worker viejo de Cloudflare sigue en el aire.** Una vez que HostGator responda bien, conviene bajarlo para que no queden dos versiones del sitio vivas.

**Ya resuelto:** las claves de Supabase antes quedaban escritas literal dentro del bundle. Ahora se declaran en `env.schema` de `astro.config.mjs`, y `SUPABASE_SECRET_KEY` está marcada como `access: "secret"` — se lee de las variables de entorno **en runtime** y no aparece en ningún archivo de `dist/`. Si falta al arrancar, el servidor tira un error explícito (`SUPABASE_SECRET_KEY is missing`) en vez de fallar de forma rara.

---

## 4. El proceso completo, paso a paso

### Paso 0 — Antes de tocar nada

Que el build local funcione y que el sitio ande en `yarn dev` contra el Supabase de Docker. Si algo está roto acá, va a estar roto en producción.

```bash
yarn supabase start     # levanta Postgres, Auth y Studio en Docker
yarn dev                # sitio en http://localhost:4321
```

### Paso 1 — Preparar la base de datos de producción

La base cloud es un proyecto Supabase distinto al de Docker. Las tablas no aparecen solas: hay que aplicarle las mismas migraciones que corriste local.

```bash
yarn supabase link --project-ref <ref>   # conecta el repo al proyecto cloud
yarn supabase db push --linked           # aplica las migraciones pendientes
```

Si el historial remoto no coincide con el local (pasa cuando hubo un squash), `db push` se planta y hay que reconciliar con `supabase migration repair --status reverted <version>` antes de reintentar.

Después, el admin: el usuario que entra a `/admin/login` no se crea con una migración, se crea contra Auth. `scripts/seed-admin.js` lo hace leyendo `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`.

### Paso 2 — Conseguir las claves de producción

Tres valores, todos del proyecto Supabase cloud:

- `PUBLIC_SUPABASE_URL` — la URL del proyecto. Pública, no es secreta.
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY` — clave de cliente. También pública; lo que la hace segura es que RLS limita qué puede hacer.
- `SUPABASE_SECRET_KEY` — service-role. **Bypassea RLS por completo.** Quien la tenga puede leer y borrar todo. Jamás a un commit.

```bash
supabase projects api-keys --project-ref <ref> --reveal -o json
```

### Paso 3 — Build

```bash
PUBLIC_SUPABASE_URL=... PUBLIC_SUPABASE_PUBLISHABLE_KEY=... yarn build
```

Las dos `PUBLIC_*` se resuelven en el build. `SUPABASE_SECRET_KEY` **no hace falta acá** — esa se configura en el servidor (Paso 5).

Genera:
- `dist/client/` — HTML pre-generado, CSS, JS de navegador, fuentes, imágenes.
- `dist/server/entry.mjs` — el servidor. Este archivo es el que Node ejecuta.

Probalo local antes de subir nada:

```bash
node ./dist/server/entry.mjs        # o: yarn start
```

### Paso 4 — Subir los archivos

Al directorio de la app en el servidor (por ejemplo `~/envero-marine`, **fuera** de `public_html`), vía File Manager de cPanel, FTP o `scp`:

- `dist/` completo
- `package.json` y `yarn.lock`

No subas `node_modules/` desde tu máquina: tiene binarios compilados para macOS que no sirven en el servidor Linux. Se instalan allá.

### Paso 5 — Configurar la app en cPanel

En cPanel → **Software → Setup Node.js App → Create Application**:

| Campo | Valor |
|---|---|
| Node.js version | 22 o superior (lo pide `engines` en `package.json`) |
| Application mode | Production |
| Application root | la carpeta donde subiste todo (ej. `envero-marine`) |
| Application URL | el dominio o subdominio |
| Application startup file | `dist/server/entry.mjs` |

Después, en la misma pantalla, **Environment variables** — las tres del Paso 2:

```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Y las dependencias. cPanel te da un comando para entrar al entorno de la app (algo como `source /home/USUARIO/nodevenv/envero-marine/22/bin/activate && cd /home/USUARIO/envero-marine`). Desde ahí:

```bash
npm install --omit=dev
```

`--omit=dev` salta las devDependencies (`sharp`, `typescript`, el CLI de Supabase), que solo se usan para desarrollar y buildear. En runtime no hacen falta, y `sharp` en particular es un módulo nativo que suele dar problemas en hosting compartido.

Por último, **Restart** en la pantalla de la app.

### Paso 6 — El dominio

HostGator ya es el registrador, así que no hay que mover nameservers: alcanza con que el dominio (o subdominio) esté asignado como *Application URL* de la app Node. El certificado HTTPS lo emite cPanel con AutoSSL; si no aparece solo, se fuerza desde **Security → SSL/TLS Status**.

Después: actualizar `site` en [`astro.config.mjs`](../astro.config.mjs), y `site_url` + `additional_redirect_urls` en la config de Auth de Supabase. Rebuild y volver a subir.

### Paso 7 — Verificar

Que cargue el home, que el formulario de contacto inserte en `message`, que el wizard de citas cree un `appointment`, que `/admin/login` deje entrar y el dashboard muestre datos, y que HTTPS esté verde.

Si algo falla, los logs de la app están en el directorio que indica la pantalla de Setup Node.js App (típicamente `~/logs/` o el `stderr` de Passenger). Un 503 casi siempre significa que el proceso no arrancó: mirá ahí primero, y sospechá de una variable de entorno faltante.

---

## 5. Redeploys

Una vez configurado, el ciclo es corto:

```bash
yarn build                    # local
# subir dist/ reemplazando el anterior
# cPanel → Setup Node.js App → Restart
```

`npm install` solo hace falta cuando cambiaron las dependencias. Las variables de entorno quedan configuradas, no se tocan en cada deploy.

---

## 6. Qué depende del cliente

| Necesitás | Para qué | Bloquea |
|---|---|---|
| Acceso a cPanel (o que ejecute los pasos 4-5) | Todo el deploy | El sitio en el aire |
| Credenciales SMTP (o luz verde para Resend) | Reset de password del admin, avisos de citas | Que el panel sea usable si pierde la clave |
| Email de destino + email del admin real | A dónde llegan los mensajes, quién entra al panel | Nada técnico, pero sin esto el sitio no sirve para nada |

El resto (contenido de marcas, datos del negocio, logos) se puede cargar con el sitio ya en el aire.

---

## 7. Vocabulario

- **Build** — compilar el código a archivos ejecutables. Local, sin consecuencias.
- **Deploy** — subir el resultado del build a un servidor. Público al instante.
- **Adapter** — el pedazo de Astro que sabe generar un servidor para una plataforma concreta. Acá, `@astrojs/node`.
- **Standalone** — modo del adapter de Node en el que el build genera un servidor HTTP completo y autónomo. La alternativa (`middleware`) genera solo un handler para montar dentro de Express y no la usamos.
- **Passenger** — el proceso de cPanel que arranca tu app Node, la mantiene viva y le pasa el tráfico que llega desde Apache/LiteSpeed. Es la razón de que no arranques el servidor a mano.
- **Startup file** — el archivo que Passenger ejecuta para levantar la app. Acá, `dist/server/entry.mjs`.
- **Prerender** — generar el HTML de una página durante el build en vez de por request. Es lo que hace que el home no toque la base de datos.
- **RLS (Row Level Security)** — reglas en Postgres sobre qué filas puede ver cada rol. Es lo que hace que una clave pública sea segura.
- **Variable de build vs. de runtime** — la de build queda escrita dentro del código compilado; la de runtime se lee del entorno cada vez que arranca el proceso. Los secretos siempre van de runtime.
- **Migración** — archivo SQL versionado que describe un cambio de schema. Se aplican en orden, y así la base de producción termina igual a la local.
