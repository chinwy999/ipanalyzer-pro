import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/shared/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { ToolWorkbench } from "@/components/tools/tool-workbench";
import { tools, isToolSlug } from "@/config/tools";
import { isLocale, siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n";

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; tool: string }> }): Promise<Metadata> {
  const { lang, tool } = await params;
  if (!isLocale(lang) || !isToolSlug(tool)) return {};
  const d = getDictionary(lang);
  const title = d.toolNames[tool];
  const description = d.toolDescriptions[tool];
  const path = `/tools/${tool}`;
  const languages: Record<string, string> = { en: `/en${path}`, ar: `/ar${path}`, fr: `/fr${path}`, "x-default": `/en${path}` };
  return { title, description, keywords: [title, d.toolPage.ip, "network tools"], alternates: { canonical: `/${lang}${path}`, languages }, openGraph: { title, description, url: `/${lang}${path}`, type: "website", siteName: d.appName, locale: lang === "ar" ? "ar_AR" : lang === "fr" ? "fr_FR" : "en_US", images: ["/images/og-image.svg"] }, twitter: { card: "summary_large_image", title, description, images: ["/images/og-image.svg"] }, robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } };
}

export default async function ToolPage({ params, searchParams }: { params: Promise<{ lang: string; tool: string }>; searchParams: Promise<{ ip?: string | string[] }> }) {
  const { lang, tool } = await params;
  if (!isLocale(lang) || !isToolSlug(tool)) notFound();
  const d = getDictionary(lang);
  const { ip } = await searchParams;
  const initialIp = Array.isArray(ip) ? ip[0] : ip;
  const url = `${siteConfig.url}/${lang}/tools/${tool}`;
  const applicationSchema = { "@context": "https://schema.org", "@type": ["WebApplication", "SoftwareApplication"], name: d.toolNames[tool], applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url, description: d.toolDescriptions[tool], offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.tools, item: `${siteConfig.url}/${lang}/tools/ip-lookup` }, { "@type": "ListItem", position: 3, name: d.toolNames[tool], item: url }] };
  const howToSchema = { "@context": "https://schema.org", "@type": "HowTo", name: d.toolNames[tool], description: d.toolDescriptions[tool], step: [{ "@type": "HowToStep", name: d.home.steps[0].title, text: d.home.steps[0].text }, { "@type": "HowToStep", name: d.home.steps[1].title, text: d.home.steps[1].text }, { "@type": "HowToStep", name: d.home.steps[2].title, text: d.home.steps[2].text }] };
  return (
    <>
      <JsonLd data={applicationSchema} /><JsonLd data={breadcrumbSchema} /><JsonLd data={howToSchema} />
      <PageIntro locale={lang} kicker={d.nav.tools} title={d.toolNames[tool]} description={d.toolDescriptions[tool]} items={[{ label: d.nav.tools, href: `/${lang}/tools` }, { label: d.toolNames[tool] }]} />
      <section className="container-shell"><ToolWorkbench locale={lang} slug={tool} initialIp={initialIp} /></section>
    </>
  );
}
