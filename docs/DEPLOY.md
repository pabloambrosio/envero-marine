# Deploy: qué es y cómo se hace en este proyecto

Guía para entender el despliegue de punta a punta, no solo copiar comandos. Está escrita asumiendo que nunca hiciste uno.

Si buscás la referencia de Supabase (schema, migraciones, RLS), esa vive en [`SUPABASE_ROADMAP.md`](../SUPABASE_ROADMAP.md). Esto es lo otro: cómo el código de tu máquina termina siendo un sitio que responde en un dominio real.

---

## 1. Qué significa "desplegar" acá

Un deploy es tomar el código fuente, convertirlo en algo que una computadora ajena pueda ejecutar, y dejarlo colgado de una dirección pública. Nada más. Lo que confunde es que en un stack moderno eso pasa en **cuatro lugares distintos**, y cada uno se administra por separado.

Este sitio tiene cuatro piezas:

| Pieza | Qué es | Dónde vive |
|---|---|---|
| **Sitio estático** | El HTML/CSS/JS de las páginas públicas (home, marcas, about). Se genera en el build y no cambia hasta el próximo deploy. | CDN de Cloudflare |
| **Worker** | Un pedacito de servidor que corre solo cuando alguien pide `/admin/*` o `/api/*`. Es quien habla con Supabase. | Cloudflare Workers |
| **Base de datos + auth** | Las tablas `appointment` y `message`, y el usuario admin que entra al panel. | Supabase (Postgres gestionado, región `sa-east-1`) |
| **Dominio** | El nombre que la gente escribe. Le dice al mundo dónde está todo lo anterior. | Registrador (HostGator) + DNS en Cloudflare |

La razón de que sean cuatro y no uno: las páginas públicas no necesitan servidor (se sirven desde el edge, gratis y rápido), pero el panel de citas sí. Astro con el adapter de Cloudflare parte el build en esos dos pedazos automáticamente. Eso está decidido en [`astro.config.mjs`](../astro.config.mjs) (`output: "server"` + `adapter: cloudflare(...)`) y en el `prerender = true` de cada página pública.

---

## 2. El mapa mental: build → deploy → DNS

```
   tu máquina                    Cloudflare                      Supabase
   ──────────                    ──────────                      ────────
                                                            
   src/                                                     
    │                                                       
    │  yarn build                                           
    ▼                                                       
   dist/                                                    
    ├── client/  ──────────►  CDN (assets estáticos)        
    └── server/  ──────────►  Worker  ──── HTTPS ─────────►  Postgres + Auth
         │                       ▲                              
         │                       │                              
    wrangler deploy              │                              
                                 │                              
                            dominio.com                         
                          (DNS apunta acá)                      
```

Tres verbos, en este orden:

1. **Build** — `yarn build` compila el proyecto y escupe `dist/`. No toca internet, no publica nada. Podés correrlo mil veces sin consecuencias.
2. **Deploy** — `wrangler deploy` sube `dist/` a Cloudflare y reemplaza lo que había. Esto **sí** es visible al instante para cualquiera que entre.
3. **DNS** — apuntar el dominio al Worker. Se hace una sola vez, no en cada deploy.

La confusión típica del primer deploy es creer que son un solo paso. No lo son: podés buildear hoy y desplegar mañana, y podés desplegar cien veces sin volver a tocar el DNS.

---

## 3. Estado actual

El sitio **ya está desplegado** en https://envero-marine.pabloambrosio91.workers.dev — o sea, los pasos 1 y 2 ya se hicieron alguna vez. Lo que falta es el paso 3 (dominio real) y limpiar tres cosas que se dejaron a medias para salir rápido.

Las tres deudas, en orden de importancia:

1. **Las claves están horneadas en el bundle.** Hoy [`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts) lee `SUPABASE_SECRET_KEY` con `import.meta.env`, que es una variable que se resuelve **en tiempo de build**: el valor queda escrito literal dentro del código subido a Cloudflare. La forma correcta es guardarla como secret en Cloudflare (`wrangler secret put`) y leerla en runtime desde `Astro.locals.runtime.env`. Es la diferencia entre "la contraseña está en el archivo" y "la contraseña está en la caja fuerte y el archivo pide que se la den".
2. **El checklist de pre-prod de Supabase nunca se aplicó** — reglas de password, `site_url`, SMTP, RLS verificada. Está en [`SUPABASE_ROADMAP.md`](../SUPABASE_ROADMAP.md#pre-prod-checklist).
3. **`site` en `astro.config.mjs` apunta al `.workers.dev`.** Ese valor es el que se usa para las URLs canónicas y los previews de Open Graph; con el dominio real hay que cambiarlo o los previews sociales van a seguir apuntando al subdominio viejo.

---

## 4. El proceso completo, paso a paso

### Paso 0 — Antes de tocar nada

Que el build local funcione y que el sitio ande en `yarn dev` contra el Supabase de Docker. Si algo está roto acá, va a estar roto en producción.

```bash
yarn supabase start     # levanta Postgres, Auth y Studio en Docker
yarn dev                # sitio en http://127.0.0.1:4321
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

- `PUBLIC_SUPABASE_URL` — la URL del proyecto. Pública, va al navegador, no es secreta.
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY` — clave de cliente. También pública; lo que la hace segura es que RLS limita qué puede hacer.
- `SUPABASE_SECRET_KEY` — service-role. **Bypassea RLS por completo.** Quien la tenga puede leer y borrar todo. Jamás al navegador, jamás a un commit.

```bash
supabase projects api-keys --project-ref <ref> --reveal -o json
```

### Paso 3 — Build

```bash
PUBLIC_SUPABASE_URL=... PUBLIC_SUPABASE_PUBLISHABLE_KEY=... yarn build
```

Genera `dist/client/` (estático) y `dist/server/` (Worker + un `wrangler.json` que Astro arma solo, con el binding de KV para las sesiones ya declarado).

### Paso 4 — Deploy

```bash
npx wrangler deploy --config dist/server/wrangler.json
```

Primera vez te va a pedir login con el navegador. Sube todo y te devuelve la URL. **A partir de este comando, el cambio es público.**

Los secrets van aparte y una sola vez (no en cada deploy):

```bash
npx wrangler secret put SUPABASE_SECRET_KEY
```

### Paso 5 — El dominio

Único paso que involucra a otra persona, y el único que no es reversible en dos minutos.

1. Agregás el dominio como zona en Cloudflare. Cloudflare escanea el DNS actual e intenta importar los registros existentes.
2. **Verificás los MX a mano.** Si el cliente tiene emails `@sudominio`, esos registros tienen que estar en Cloudflare antes de seguir, o le cortás el correo.
3. Cloudflare te da dos nameservers. El cliente los pega en el panel de su registrador, reemplazando los que están.
4. Esperás la propagación (minutos a algunas horas).
5. En el Worker, *Settings → Domains & Routes → Add Custom Domain*. Cloudflare emite el certificado HTTPS solo.
6. Actualizás `site` en `astro.config.mjs`, y `site_url` + `additional_redirect_urls` en la config de Auth de Supabase. Rebuild y redeploy.

### Paso 6 — Verificar

Que cargue el home, que el formulario de contacto inserte en `message`, que el wizard de citas cree un `appointment`, que `/admin/login` deje entrar y el dashboard muestre datos, y que HTTPS esté verde. Si algo del Worker falla, `npx wrangler tail` te da los logs en vivo.

---

## 5. Qué depende del cliente

De todo lo anterior, solo tres cosas no las podés resolver vos:

| Necesitás | Para qué | Bloquea |
|---|---|---|
| Nameservers cambiados en el registrador | Paso 5 completo | El dominio real |
| Credenciales SMTP (o luz verde para Resend) | Reset de password del admin, avisos de citas | Que el panel sea usable si pierde la clave |
| Email de destino + email del admin real | A dónde llegan los mensajes, quién entra al panel | Nada técnico, pero sin esto el sitio no sirve para nada |

El resto (contenido de marcas, datos del negocio, logos) se puede cargar con el sitio ya en el aire.

---

## 6. Vocabulario

- **Build** — compilar el código a archivos ejecutables. Local, sin consecuencias.
- **Deploy** — subir el resultado del build a un servidor. Público al instante.
- **Worker** — función que corre en los servidores de Cloudflare, cerca del usuario. Se cobra por invocación, no por tiempo encendido.
- **Edge / CDN** — la red de servidores distribuidos que sirve los archivos estáticos.
- **Nameservers (NS)** — los servidores que responden "¿a qué IP corresponde este dominio?". Cambiarlos es mudar el control del DNS.
- **Registro MX** — el que dice a qué servidor van los emails del dominio. Independiente de la web; por eso se rompe tan fácil sin querer.
- **Propagación** — el rato que tardan los DNS del mundo en enterarse de un cambio.
- **RLS (Row Level Security)** — reglas en Postgres sobre qué filas puede ver cada rol. Es lo que hace que una clave pública sea segura.
- **Secret** — variable de entorno guardada cifrada en Cloudflare, inyectada en runtime. Distinta de una var de build, que queda escrita en el bundle.
- **Migración** — archivo SQL versionado que describe un cambio de schema. Se aplican en orden, y así la base de producción termina igual a la local.
