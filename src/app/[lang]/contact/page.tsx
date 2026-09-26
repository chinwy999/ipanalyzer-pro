import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/shared/contact-form";
import { PageIntro } from "@/components/shared/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { getDictionary } from "@/lib/i18n";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLocale(lang)) return {}; const d = getDictionary(lang);
  return { title: d.nav.contact, description: d.contact.subtitle, alternates: { canonical: `/${lang}/contact`, languages: { en: "/en/contact", ar: "/ar/contact", fr: "/fr/contact", "x-default": "/en/contact" } }, ...socialMetadata(lang, d.contact.title, d.contact.subtitle, "/contact") };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang);
  const schema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.contact, item: `${siteConfig.url}/${lang}/contact` }] };
  return <><JsonLd data={schema} /><PageIntro locale={lang} kicker={d.appName} title={d.contact.title} description={d.contact.subtitle} items={[{ label: d.nav.contact }]} /><section className="container-shell section-tight"><div className="contact-layout"><aside className="contact-aside"><span className="tool-icon blue"><MessageCircle size={18} /></span><h2>{d.contact.title}</h2><p>{d.contact.subtitle}</p><div className="notice info" style={{ marginTop: 22 }}><ShieldCheck size={15} /><span>{d.contact.emailHelp}</span></div><p style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 21 }}><Mail size={15} /><a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@yourdomain.com"}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@yourdomain.com"}</a></p></aside><div className="workspace" style={{ margin: 0 }}><div className="workspace-head"><div><h2>{d.nav.contact}</h2><p>{d.contact.emailHelp}</p></div></div><div className="workspace-body"><ContactForm locale={lang} /></div></div></div></section></>;
}
