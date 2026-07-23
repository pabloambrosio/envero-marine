# Wizard de contacto: pasos "Tus datos" y "Confirma" — diseño

Fecha: 2026-07-23
Estado: aprobado, pendiente de implementación

## Objetivo

Cerrar el flujo público de `/contact`. Hoy `AppointmentWizard` solo tiene el paso 1 (calendario + horarios) y no envía nada al backend. Se agregan los pasos 2 ("Tus datos") y 3 ("Confirma"), con submit real a `POST /api/appointments`.

El `i18n` (`src/i18n/ui.ts`) ya tiene casi todas las claves para un wizard de 3 pasos con stepper (`wizard.steps.*`, `wizard.contact.*`, `wizard.confirm.*`, `wizard.success.*`, `wizard.alert.*`, `wizard.button.*`), preparadas cuando se diseñó el flujo pero nunca implementadas.

## Regla de negocio (nueva, ajusta el backend)

`name` y `phone` obligatorios. `email` y `company_name` opcionales. Antes email era obligatorio (`NOT NULL` en DB, `z.email()` sin `.optional()`); se afloja porque el teléfono ya garantiza un canal de contacto.

La copy `wizard.contact.error.contactRequired` ("indica al menos un email o un teléfono") quedó del diseño original y ya no aplica — no se usa. Se agrega una clave nueva `wizard.contact.error.phoneRequired` (es/en) para el caso real: teléfono vacío.

## Backend

- Migración nueva: `alter table public.appointment alter column email drop not null;`
- `RequestAppointmentSchema` (`src/modules/appointment/types/request.ts`): `email: z.email().optional()`.
- `CreateAppointmentSchema` (`src/modules/appointment/types/appointment.ts`, flujo admin): mismo cambio, para que el admin también pueda cargar una cita sin email.
- `AppAppointment.email`: pasa a `string | null`.
- `services/request.ts`: agrega `email` al insert condicionalmente, mismo patrón que ya usa con `notes`/`company_name`.
- Admin (`new.astro`, `edit.astro`, `[id]/index.astro`, `appointments.astro`): sacar `required` del input de email; manejar `email === null` en detalle/lista igual que ya se maneja `notes` (fallback visual, sin link `mailto:` si no hay valor).

## Frontend — estructura del wizard

`AppointmentWizard.tsx` pasa a orquestar 3 pasos con `useState<"schedule" | "contact" | "confirm" | "success">`.

**Hooks:**
- `useAppointmentCalendar()` — existente, sin cambios (día/hora).
- `useAppointmentContact()` (nuevo) — estado de `name`, `phone`, `email`, `company_name`, `notes`, y validación por campo: `nameRequired`, `phoneRequired`, `emailInvalid` (formato, solo si se completó).
- Estado de envío: `idle | submitting | error`, con distinción entre error de red (`wizard.alert.network`) y error de servidor (`wizard.alert.serverGeneric`, o mapeo de `issues[]` del 400 a campo si el backend rechaza algo que el front no validó).

**Componentes nuevos** (`src/components/appointment/`):
- `StepIndicator.tsx` — usa `wizard.steps.aria/schedule/contact/confirm`. Mono uppercase + hairline, resalta paso activo y marca completados. No usa color más allá del acento ya establecido (nada de verde/naranja nuevos).
- `ContactStep.tsx` — inputs nombre/teléfono (requeridos)/email/empresa (opcionales). Botones "Atrás"/"Continuar" (`wizard.button.back/next`). "Continuar" deshabilitado si nombre o teléfono vacíos, o email con formato inválido.
- `ConfirmStep.tsx` — resumen de fecha/hora/nombre/contacto/empresa (`wizard.confirm.summary.*`), textarea de notas opcional (`wizard.confirm.field.notes`), botón "Enviar solicitud" → estado `submitting…` (`wizard.button.submit/submitting`).
- `SuccessPanel.tsx` — `wizard.success.tag/title/lead`. `{via}` siempre reemplazado por el teléfono cargado (decisión del usuario: no depende de si hay email). `{when}` reemplazado por fecha+hora formateada en el locale activo.

El paso 1 (Agenda) reutiliza `CalendarGrid` + `SlotPicker` tal cual existen hoy; se agrega un botón "Continuar" al pie, deshabilitado hasta que haya día **y** hora seleccionados.

## Armado de `appointment_date`

Nuevo helper en `dateUtils.ts`: combina el día elegido (`Date` a medianoche local del browser) + la hora del slot, interpretados en `America/Merida` (UTC-6 fijo, sin DST — mismo supuesto que ya usa `modules/appointment/lib/slot.ts` en el backend). Se construye con `Date.UTC(year, month, day, hour + 6, 0, 0)` y se manda como ISO string. Evita depender del huso horario del visitante.

## Payload de envío

```
POST /api/appointments
{
  name: string,
  phone: string,
  email?: string,
  company_name?: string,
  appointment_date: string, // ISO
  notes?: string
}
```

## Labels

`AppointmentWizardLabels` (`components/appointment/types.ts`) se extiende con todas las claves nuevas, resueltas server-side con `t()` en `src/pages/contact/index.astro` — mismo patrón que ya usan `intro`/`weekdays`/etc. No se llama `t()` dentro de componentes React; los templates con placeholders (`wizard.success.lead`) se pasan crudos como prop y el reemplazo de `{via}`/`{when}` ocurre en `SuccessPanel.tsx`.

## Fuera de alcance

- Validar disponibilidad real de horarios contra citas ya existentes (doble booking) — no existe hoy, no se agrega en esta ronda.
- `wizard.schedule.noSlot` ("sin horarios disponibles") — sigue sin usarse, sería para cuando exista esa validación.
