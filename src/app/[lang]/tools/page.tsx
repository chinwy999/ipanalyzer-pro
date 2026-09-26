import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/shared/page-intro";
import { ToolCard } from "@/components/shared/tool-card";
import { JsonLd } from "@/components/shared/json-ld";
import { tools } from "@/config/tools";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLocale(lang)) return {}; const d = getDictionary(lang);
  return { title: d.nav.tools, description: d.home.toolsSubtitle, alternates: { canonical: `/${lang}/tools`, languages: { en: "/en/tools", ar: "/ar/tools", fr: "/fr/tools", "x-default": "/en/tools" } }, ...socialMetadata(lang, d.nav.tools, d.home.toolsSubtitle, "/tools") };
}

export default async function ToolsIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang);
  const schema = { "@context": "https://schema.org", "@type": "ItemList", name: d.nav.tools, itemListElement: tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: d.toolNames[tool.slug], url: `${siteConfig.url}/${lang}/tools/${tool.slug}` })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.tools, item: `${siteConfig.url}/${lang}/tools` }] };
  return <><JsonLd data={schema} /><JsonLd data={breadcrumb} /><PageIntro locale={lang} kicker={d.appName} title={d.home.toolsTitle} description={d.home.toolsSubtitle} items={[{ label: d.nav.tools }]} /><section className="container-shell section-tight"><div className="tools-grid">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} locale={lang} />)}</div></section></>;
}
