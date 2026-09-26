import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { PageIntro } from "@/components/shared/page-intro";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n";

const legalSlugs = ["privacy", "terms", "disclaimer", "cookies"] as const;
type LegalSlug = (typeof legalSlugs)[number];
function titleFor(slug: LegalSlug, d: ReturnType<typeof getDictionary>) { return slug === "privacy" ? d.legal.privacy : slug === "terms" ? d.legal.terms : slug === "disclaimer" ? d.legal.disclaimer : d.legal.cookies; }
function contentFor(slug: LegalSlug, d: ReturnType<typeof getDictionary>) { return slug === "privacy" ? d.legal.privacySections : slug === "terms" ? d.legal.termsSections : slug === "disclaimer" ? d.legal.disclaimerSections : d.legal.cookiesSections; }

export async function generateStaticParams() { return legalSlugs.map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; if (!isLocale(lang) || !legalSlugs.includes(slug as LegalSlug)) return {}; const d = getDictionary(lang); const title = titleFor(slug as LegalSlug, d);
  return { title, description: d.legal.intro, robots: { index: true, follow: true }, alternates: { canonical: `/${lang}/legal/${slug}`, languages: { en: `/en/legal/${slug}`, ar: `/ar/legal/${slug}`, fr: `/fr/legal/${slug}`, "x-default": `/en/legal/${slug}` } }, ...socialMetadata(lang, title, d.legal.intro, `/legal/${slug}`) };
}

export default async function LegalPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params; if (!isLocale(lang) || !legalSlugs.includes(slug as LegalSlug)) notFound(); const d = getDictionary(lang); const title = titleFor(slug as LegalSlug, d); const sections = contentFor(slug as LegalSlug, d);
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.footer.legal, item: `${siteConfig.url}/${lang}/legal/privacy` }, { "@type": "ListItem", position: 3, name: title, item: `${siteConfig.url}/${lang}/legal/${slug}` }] };
  return <><JsonLd data={breadcrumb} /><PageIntro locale={lang} kicker={d.footer.legal} title={title} description={d.legal.intro} items={[{ label: d.footer.legal, href: `/${lang}/legal/privacy` }, { label: title }]} /><section className="container-shell section-tight"><div className="legal-content">{sections.map((section, index) => <article className="legal-section" key={section.title}><h2>{section.title}</h2><p>{section.body}</p>{index === sections.length - 1 && <p className="helper-text">{d.legal.intro}</p>}</article>)}</div></section></>;
}
