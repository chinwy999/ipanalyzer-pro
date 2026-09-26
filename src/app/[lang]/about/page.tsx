import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { PageIntro } from "@/components/shared/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { getDictionary } from "@/lib/i18n";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLocale(lang)) return {}; const d = getDictionary(lang);
  return { title: d.about.title, description: d.about.subtitle, alternates: { canonical: `/${lang}/about`, languages: { en: "/en/about", ar: "/ar/about", fr: "/fr/about", "x-default": "/en/about" } }, ...socialMetadata(lang, d.about.title, d.about.subtitle, "/about") };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang);
  const schema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.about, item: `${siteConfig.url}/${lang}/about` }] };
  const icons = [Sparkles, ShieldCheck, Waypoints];
  return <><JsonLd data={schema} /><PageIntro locale={lang} kicker={d.appName} title={d.about.title} description={d.about.subtitle} items={[{ label: d.nav.about }]} /><section className="container-shell section-tight"><div className="article-callout" style={{ padding: 25, fontSize: 14 }}>{d.about.body}</div><div style={{ marginTop: 36 }}><div className="section-heading"><div><div className="section-kicker">{d.appName}</div><h2>{d.about.principlesTitle}</h2></div></div><div className="benefits-grid">{d.about.principles.map((principle, index) => { const Icon = icons[index]; return <article className="benefit-card" key={principle.title}><span className="benefit-mark"><Icon size={18} /></span><h3>{principle.title}</h3><p>{principle.text}</p></article>; })}</div></div></section></>;
}
