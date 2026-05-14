// Reglas de slot para citas. Fuente de verdad única — el schema Zod del
// request público, el front (cuando pinte horarios disponibles) y la futura
// validación del flujo admin tienen que pasar por acá.
//
// Negocio (Ciudad del Carmen, Campeche, México):
//   * Lunes a viernes.
//   * Horario laboral 08:00–18:00.
//   * Slots discretos de una hora en punto. Último slot empieza 17:00.
//   * Timezone fijo en `America/Merida` (UTC-6, sin DST desde 2022).
//
// `appointment_date` se guarda como `timestamptz` (UTC). Para validar la regla
// horaria hay que leer la fecha en el huso de la empresa, no en UTC — un slot
// "14:00 en Carmen" es "20:00 UTC". Por eso `Intl.DateTimeFormat` con timeZone.

export const BUSINESS_TIMEZONE = "America/Merida";
export const BUSINESS_HOUR_START = 8;
export const BUSINESS_HOUR_END_EXCLUSIVE = 18;

export type SlotInvalidReason = "weekend" | "out_of_hours" | "not_on_hour";

export type SlotValidation =
  | { ok: true }
  | { ok: false; reason: SlotInvalidReason };

interface DatePartsInTZ {
  dow: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
}

function partsInTimezone(date: Date, timeZone: string): DatePartsInTZ {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const lookup: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }

  // Algunos runtimes devuelven la medianoche como "24" en vez de "00".
  const rawHour = parseInt(lookup.hour, 10);
  const hour = rawHour === 24 ? 0 : rawHour;

  const year = parseInt(lookup.year, 10);
  const month = parseInt(lookup.month, 10);
  const day = parseInt(lookup.day, 10);

  // Construir la fecha en UTC con los componentes locales y leer getUTCDay
  // evita interferencia del huso del runtime.
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    dow,
    hour,
    minute: parseInt(lookup.minute, 10),
    second: parseInt(lookup.second, 10),
    ms: date.getUTCMilliseconds(),
  };
}

export function isValidSlot(date: Date): SlotValidation {
  if (Number.isNaN(date.getTime())) {
    return { ok: false, reason: "not_on_hour" };
  }

  const parts = partsInTimezone(date, BUSINESS_TIMEZONE);

  if (parts.minute !== 0 || parts.second !== 0 || parts.ms !== 0) {
    return { ok: false, reason: "not_on_hour" };
  }

  if (parts.dow === 0 || parts.dow === 6) {
    return { ok: false, reason: "weekend" };
  }

  if (
    parts.hour < BUSINESS_HOUR_START ||
    parts.hour >= BUSINESS_HOUR_END_EXCLUSIVE
  ) {
    return { ok: false, reason: "out_of_hours" };
  }

  return { ok: true };
}
