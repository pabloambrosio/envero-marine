import { defaultLang, ui, type Lang, type TranslationKey } from "./ui";

export function resolveLang(value: string | undefined): Lang {
  return value === "en" ? "en" : defaultLang;
}

export function useTranslations(lang: string | undefined) {
  const safe = resolveLang(lang);
  return function t(key: TranslationKey): string {
    return ui[safe][key];
  };
}
