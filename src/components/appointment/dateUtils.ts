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
