import { siteConfig, type Locale } from "@/config/site";

export function canonicalFor(locale: Locale, path = ""): string {
  return `${siteConfig.url}/${locale}${path ? `/${path.replace(/^\//, "")}` : ""}`;
}

export function languageAlternates(path = ""): Record<string, string> {
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  return { en: `/en${suffix}`, ar: `/ar${suffix}`, fr: `/fr${suffix}`, "x-default": `/en${suffix}` };
}

export function socialMetadata(locale: Locale, title: string, description: string, path: string, type: "website" | "article" = "website") {
  const url = canonicalFor(locale, path);
  const localeTag = locale === "ar" ? "ar_AR" : locale === "fr" ? "fr_FR" : "en_US";
  return {
    openGraph: { type, title, description, url, siteName: siteConfig.name, locale: localeTag, images: [{ url: "/images/og-image.svg", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image" as const, title, description, images: ["/images/og-image.svg"] },
  };
}
