export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function localeFor(lang: string): string {
  return lang === "en" ? "en-US" : "es-MX";
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthYear(date: Date, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  return capitalize(fmt.format(date));
}

export function formatLongDate(date: Date, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return capitalize(fmt.format(date));
}

// `BUSINESS_TIMEZONE` (America/Merida, backend) es UTC-6 fijo sin DST desde
// 2022 — mismo supuesto que usa `modules/appointment/lib/slot.ts` en el
// servidor. `date` llega en medianoche local del browser (año/mes/día
// puros); combinarla con `hour` así evita que el huso del visitante
// corra el slot elegido.
export function buildAppointmentDateISO(date: Date, hour: number): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour + 6, 0, 0),
  ).toISOString();
}

export function formatLongDateTime(date: Date, hour: number, locale: string): string {
  const day = formatLongDate(date, locale);
  return `${day}, ${String(hour).padStart(2, "0")}:00`;
}
