# Rediseño del navbar — que refleje lo que la página ofrece

Fecha: 2026-07-23

## Problema

El navbar se armó al principio con nombres placeholder y quedó desalineado con
el contenido real de la home.

| Link actual | href | Estado |
| --- | --- | --- |
| Servicios | `#servicios` | Roto — ningún elemento tiene ese id |
| Nosotros | `#nosotros` | Correcto (`About.astro`) |
| Contacto | `#contacto` | Id duplicado entre `Contact.tsx` y `Footer.astro` |

Además:

- `Footer.astro` repite el mismo array de links roto.
- El CTA dice "Cotización" pero lleva a `/contact`, que es el wizard
  "Agendar conversación".
- El hero enlaza a `#servicios`, que tampoco existe.
- Abajo de 880 px el menú se oculta por completo y no hay reemplazo: en móvil
  el navbar es solo logo y toggle de idioma.

Las secciones reales de la home, en orden de scroll: Hero, Features (sin id),
BentoBrands (sin id), Metalurgia `#fabricacion`, Naval `#naval`,
About `#nosotros`, Contact `#contacto`.

## Decisiones

1. **Navbar agrupado de tres items** — `Servicios ▾ · Nosotros · Contacto`.
   El desplegable evita una barra de cinco links y mantiene el navbar sobrio.
2. **Dropdown agrupado por tipo de servicio**, con eyebrow mono y subtítulo por
   item. Reusa la distinción propio/representado que el sitio ya hace en los
   eyebrows de sección.
3. **Panel móvil completo** — botón de menú que abre un overlay con los mismos
   grupos ya expandidos, más el CTA. Cierra el agujero de navegación en móvil.
4. **CTA renombrado a "Agendar" / "Book a call"**, que es lo que `/contact`
   hace. El destino no cambia.

## Arquitectura de navegación

```
[logo]   Servicios ▾   Nosotros   Contacto   │ ES/EN   [Agendar →]
             │
             ├─ SERVICIOS PROPIOS ────────────────────
             │  Metalurgia            → #metalurgia
             │    Fabricación de estructuras a medida
             │  Ingeniería naval      → #naval
             │    Diseño, cálculo y certificación
             │
             └─ MARCAS REPRESENTADAS ─────────────────
                Marcas representadas  → #marcas
                  TotalEnergies · Current Technology · Qer · Fonroche
```

## Normalización de ids

Los anchors quedan con un mismo criterio: nombre de la línea, en español,
sin prefijos.

| Componente | Antes | Después |
| --- | --- | --- |
| `Features.astro` | — | `id="capacidades"` |
| `BentoBrands.astro` | — | `id="marcas"` |
| `Metalurgia.astro` | `#fabricacion` | `#metalurgia` |
| `NavalTabs.astro` | `#naval` | sin cambio |
| `About.astro` | `#nosotros` | sin cambio |
| `Contact.tsx` | `#contacto` | sin cambio |
| `Footer.astro` | `#contacto` | **id eliminado** (duplicaba el de Contact) |

El "Ver servicios" del hero pasa a apuntar a `#capacidades`, que es la sección
que resume la oferta.

El footer no usa dropdown: su columna "Navegar" pasa a la lista plana de cinco
—Metalurgia, Ingeniería naval, Marcas representadas, Nosotros, Contacto—
porque ahí el espacio vertical sobra.

## Comportamiento

**Dropdown (≥880 px)**

- El disparador es un `<button>`, no un `<a>`: no existe una sección "Servicios"
  a la que ir. Lleva `aria-expanded` y `aria-controls`.
- Abre por click, no por hover: hover-only rompe touch y teclado.
- Cierra con `Escape`, con click afuera, al seguir un link y al perder el foco.
- El chevron rota 180°. Panel con fade y 4 px de desplazamiento, 160 ms.

**Panel móvil (<880 px)**

- Botón de menú con dos hairlines, no un icono redondeado.
- Overlay `fixed` bajo el header, fondo crema opaco, scroll interno.
- Los dos grupos vienen expandidos: sin acordeón, sin un segundo nivel que abrir.
- Bloquea el scroll del body, cierra con `Escape`, al navegar y al volver a
  desktop por resize.
- El CTA reaparece dentro del panel; hoy se oculta abajo de 560 px.

**`prefers-reduced-motion`** desactiva las transiciones.

## Encaje con la dirección visual

Las tres voces de `CLAUDE.md` se mantienen separadas:

- Los links de primer nivel y el disparador son Inter `--fs-sm`
  `--color-ink-muted` — voz de navegación.
- Los eyebrows de grupo son JetBrains Mono 0.7 rem, `.18em`, uppercase — voz de
  control técnico.
- Los items del dropdown son Inter: título en `--color-ink`, subtítulo
  `--fs-xs` en `--color-ink-muted`.

Los eyebrows del dropdown van en `--color-ink-muted`, **no** en naranja: el
acento ya está gastado en el CTA y en la opción activa del `LangToggle`, y
sumar dos eyebrows naranjas dentro del panel lo repartiría de más.

El panel se apoya en un hairline de 1 px y fondo opaco, sin sombra blanda y sin
border-radius, según las reglas del sistema.

## Claves i18n nuevas

`nav.services` se reusa como label del disparador. Se agregan, en `es` y `en`:

```
nav.services.panelAria
nav.group.own          Servicios propios     / In-house services
nav.group.partner      Marcas representadas  / Represented brands
nav.item.metalurgia         + .desc
nav.item.naval              + .desc
nav.item.brands             + .desc
nav.menu.open / nav.menu.close
```

`nav.cta` cambia de valor: "Cotización" → "Agendar" / "Get a quote" → "Book a call".

## Fuera de alcance

- Scroll-spy o estado activo por sección visible.
- Navbar que cambie de fondo al hacer scroll.
- Tocar el contenido de las secciones enlazadas.
