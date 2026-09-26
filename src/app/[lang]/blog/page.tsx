import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, Globe2, Network, ShieldCheck, Waypoints, Zap } from "lucide-react";
import { PageIntro } from "@/components/shared/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { blogPosts } from "@/data/blog-posts";
import { getDictionary } from "@/lib/i18n";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";

const icons = [Globe2, Network, BookOpen, ShieldCheck, Waypoints, Zap];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLocale(lang)) return {}; const d = getDictionary(lang);
  return { title: d.blog.title, description: d.blog.subtitle, alternates: { canonical: `/${lang}/blog`, languages: { en: "/en/blog", ar: "/ar/blog", fr: "/fr/blog", "x-default": "/en/blog" } }, ...socialMetadata(lang, d.blog.title, d.blog.subtitle, "/blog") };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang);
  const list = { "@context": "https://schema.org", "@type": "ItemList", name: d.blog.title, itemListElement: blogPosts.map((post, index) => ({ "@type": "ListItem", position: index + 1, name: post.translations[lang].title, url: `${siteConfig.url}/${lang}/blog/${post.slug}` })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.blog, item: `${siteConfig.url}/${lang}/blog` }] };
  return <><JsonLd data={list} /><JsonLd data={breadcrumb} /><PageIntro locale={lang} kicker={d.appName} title={d.blog.title} description={d.blog.subtitle} items={[{ label: d.nav.blog }]} /><section className="container-shell section-tight"><div className="article-grid">{blogPosts.map((post, index) => { const item = post.translations[lang]; const Icon = icons[index]; return <Link className="article-card" href={`/${lang}/blog/${post.slug}`} key={post.slug}><div className="article-cover"><Icon size={29} strokeWidth={1.25} /></div><div className="article-content"><span className="article-category">{item.category} · {post.minutes} {d.blog.readTime}</span><h3>{item.title}</h3><p>{item.excerpt}</p><span className="text-link" style={{ marginTop: 15 }}>{d.blog.read}<ArrowUpRight size={13} /></span></div></Link>; })}</div></section></>;
}
