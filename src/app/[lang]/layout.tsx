import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrganizationJsonLd } from "@/components/shared/json-ld";
import { siteConfig, isLocale, type Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import { socialMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return siteConfig.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  const alternates = Object.fromEntries(siteConfig.locales.map((locale) => [locale, `/${locale}`]));
  alternates["x-default"] = "/en";
  return {
    title: { default: d.hero.title, template: `%s | ${d.appName}` },
    description: d.hero.description,
    keywords: lang === "ar" ? ["بحث IP", "موقع IP", "أدوات الشبكات"] : lang === "fr" ? ["recherche IP", "géolocalisation IP", "outils réseau"] : ["IP lookup", "IP geolocation", "network tools"],
    authors: [{ name: d.appName }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    alternates: { canonical: `/${lang}`, languages: alternates },
    ...socialMetadata(lang, d.hero.title, d.hero.description, "/"),
    other: { author: d.appName },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader locale={lang as Locale} />
      <main className="site-main">{children}</main>
      <SiteFooter locale={lang as Locale} />
    </>
  );
}
