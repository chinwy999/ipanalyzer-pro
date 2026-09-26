export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "IPAnalyzer Pro",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://ip-analyzer-pro.vercel.app").replace(/\/+$/, ""),
  description: "Understand IP addresses, location data and network signals with practical, privacy-conscious tools.",
  defaultLocale: "en" as const,
  locales: ["en", "ar", "fr"] as const,
};

export type Locale = (typeof siteConfig.locales)[number];

export function isLocale(value: string): value is Locale {
  return siteConfig.locales.includes(value as Locale);
}
