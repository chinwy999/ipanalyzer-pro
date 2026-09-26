import type { Locale } from "@/config/site";

export const languages: Record<Locale, { label: string; nativeName: string; direction: "ltr" | "rtl" }> = {
  en: { label: "English", nativeName: "English", direction: "ltr" },
  ar: { label: "Arabic", nativeName: "العربية", direction: "rtl" },
  fr: { label: "French", nativeName: "Français", direction: "ltr" },
};
