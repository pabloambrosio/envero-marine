# Booking wizard en hero — diseño

Fecha: 2026-05-01
Estado: aprobado, pendiente de implementación

## Objetivo

Sumar un wizard de 3 pasos (calendario → datos → confirmación) en la columna derecha del hero, sin romper la composición editorial actual y sin apoyarse en backend.

## Restricciones que mandan

- Sin backend (Supabase entra después). El submit es cosmético — no hay fetch, no hay validación, no hay persistencia.
- Astro puro, sin React. Estado vanilla TS dentro de `<script>` del wizard.
- Voz "controles técnicos" del CLAUDE.md: mono uppercase, hairlines, naranja escaso.
- Tokens existentes mandan. No se introducen colores ni radius nuevos.

## Estructura de archivos

```
src/components/booking/
├── BookingWizard.astro     contenedor + estado + step 3 inline
├── BookingCalendar.astro   calendario navegable mes a mes
└── BookingForm.astro       3 inputs (empresa / email / teléfono) con icons FA
```

`HeroBanner.astro` solo importa `BookingWizard` y lo posiciona en la columna derecha. Cero lógica nueva en el hero.

## Layout

`.hero__inner` pasa de flex a `grid-template-columns: minmax(0, 1fr) minmax(0, 480px)` en desktop. El bloque editorial mantiene su `max-width: 820px` natural en la columna izquierda; el wizard ocupa la derecha como panel con borde hairline blanco y fondo `rgba(255,255,255,0.03)`. En `<880px` el grid colapsa a una columna y el wizard cae debajo del bloque de stats.

## Estado

```
state = {
  step: 1 | 2 | 3,
  selectedDate: Date | null,
  currentMonth: Date  // primer día del mes visible en el calendario
}
```

Transiciones:
- click en celda válida → `selectedDate = X`, `step = 2`
- submit del form → `preventDefault()`, `step = 3`
- click "← cambiar fecha" → `step = 1`
- click "← agendar otra" → reset completo

Render = un solo `applyState()` que muestra/oculta los tres `<div data-step>` y actualiza el resumen de fecha en el paso 2. Re-render del grid del calendario solo cuando cambia `currentMonth`.

## Calendario (paso 1)

- Header mono: `← MAY 2026 →`. Las flechas son botones mono, hover naranja.
- Nombre de mes y de días salen de `Intl.DateTimeFormat(lang)` — no se hardcodea en `ui.ts`.
- Grid 7 columnas, header de días en mono pequeño.
- Celdas cuadradas, sin radius. Estados:
  - default: texto blanco, hover con borde 1px naranja
  - pasada: `opacity: 0.25`, `pointer-events: none`
  - hoy: punto naranja debajo del número
  - seleccionada: fondo `--color-accent` sólido, texto blanco
- Sin restricción de días hábiles. Todas las fechas desde hoy en adelante son seleccionables.

## Form (paso 2)

- Cabecera mono con la fecha elegida (`MAR 12 MAY 2026`) + botón ghost `← CAMBIAR FECHA`.
- 3 inputs con borde inferior 1px hairline blanco, sin caja completa.
- Icon Font Awesome a la izquierda dentro del input, color naranja: `fa-building`, `fa-envelope`, `fa-phone-flip`.
- Label arriba en mono uppercase pequeño. Placeholder gris claro.
- CTA primary naranja `AGENDAR →`.

## Confirmación (paso 3)

- Eyebrow mono `[ ✓ ] CONFIRMADO`.
- Texto breve "Recibido. Te contactamos en 24 h."
- Botón ghost `← AGENDAR OTRA FECHA` que resetea todo.

## Font Awesome

Se agrega `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">` en `<head>` de `Layout.astro`. Tres iconos en total. Costo: ~30KB y un request externo. Si más adelante molesta, se cambia por SVG inline.

## i18n — keys nuevas en `src/i18n/ui.ts`

```
booking.eyebrow            [ 02 ] AGENDAR REUNIÓN              [ 02 ] BOOK A MEETING
booking.step1.title        Elegí una fecha                     Pick a date
booking.step2.title        Tus datos                           Your details
booking.step2.changeDate   ← Cambiar fecha                     ← Change date
booking.field.company      Empresa                             Company
booking.field.email        Email                               Email
booking.field.phone        Teléfono                            Phone
booking.submit             Agendar                             Book
booking.step3.title        Confirmado                          Confirmed
booking.step3.body         Recibido. Te contactamos en 24 h.   Got it. We'll be in touch within 24h.
booking.step3.reset        ← Agendar otra fecha                ← Book another date
booking.calendar.prev      Mes anterior (aria)                 Previous month (aria)
booking.calendar.next      Mes siguiente (aria)                Next month (aria)
```

Los nombres de mes y de día NO van en `ui.ts` — se derivan de `Intl.DateTimeFormat(lang, { month: "long" })` y similares al render.

## Lo que queda fuera de alcance

- Validación de campos. Sin asteriscos, sin mensajes de error, sin `required`.
- Persistencia o envío real. El submit no hace fetch.
- Restricción de días (hábiles, blackout dates, lead time).
- Selección de hora.
- Estado en URL o localStorage. Refresh = wizard vuelve al paso 1.
- Animaciones de transición entre pasos. Cambio de visibilidad directo.
