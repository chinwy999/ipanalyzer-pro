import en from "../../locales/en.json";
import ar from "../../locales/ar.json";
import fr from "../../locales/fr.json";
import type { Locale } from "@/config/site";

export const dictionaries = { en, ar, fr } as const;
export type Dictionary = typeof en;
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}
export function direction(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
