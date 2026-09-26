import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Search as SearchIcon } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { PageIntro } from "@/components/shared/page-intro";
import { ToolCard } from "@/components/shared/tool-card";
import { isLocale, siteConfig } from "@/config/site";
import { socialMetadata } from "@/lib/seo";
import { tools } from "@/config/tools";
import { blogPosts } from "@/data/blog-posts";
import { getDictionary } from "@/lib/i18n";
import { isValidIp } from "@/lib/validators";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; if (!isLocale(lang)) return {}; const d = getDictionary(lang);
  return { title: d.searchPage.title, description: d.searchPage.subtitle, robots: { index: false, follow: true }, alternates: { canonical: `/${lang}/search`, languages: { en: "/en/search", ar: "/ar/search", fr: "/fr/search", "x-default": "/en/search" } }, ...socialMetadata(lang, d.searchPage.title, d.searchPage.subtitle, "/search") };
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string | string[] }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang); const queryValue = (await searchParams).q; const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue || "").trim(); const needle = query.toLocaleLowerCase(lang);
  const matchingTools = query ? tools.filter((tool) => `${d.toolNames[tool.slug]} ${d.toolDescriptions[tool.slug]}`.toLocaleLowerCase(lang).includes(needle)) : tools;
  const matchingPosts = query ? blogPosts.filter((post) => { const item = post.translations[lang]; return `${item.title} ${item.excerpt} ${item.category}`.toLocaleLowerCase(lang).includes(needle); }) : [];
  const schema = { "@context": "https://schema.org", "@type": "ItemList", name: d.searchPage.results, itemListElement: [...matchingTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: d.toolNames[tool.slug], url: `${siteConfig.url}/${lang}/tools/${tool.slug}` })), ...matchingPosts.map((post, index) => ({ "@type": "ListItem", position: matchingTools.length + index + 1, name: post.translations[lang].title, url: `${siteConfig.url}/${lang}/blog/${post.slug}` }))] };
  return <><JsonLd data={schema} /><PageIntro locale={lang} kicker={d.nav.search} title={d.searchPage.title} description={d.searchPage.subtitle} items={[{ label: d.nav.search }]} /><section className="container-shell section-tight"><form action={`/${lang}/search`} className="search-panel" style={{ maxWidth: 700, marginTop: 0, marginBottom: 34 }}><SearchIcon className="search-icon" size={18} /><label className="sr-only" htmlFor="site-query">{d.searchPage.placeholder}</label><input id="site-query" name="q" defaultValue={query} placeholder={d.searchPage.placeholder} /><button className="btn-primary" type="submit">{d.nav.search}</button></form>{query && isValidIp(query) && <div className="article-callout" style={{ marginBottom: 27 }}>{d.toolPage.lookupFor} <strong>{query}</strong> <Link className="text-link" href={`/${lang}/tools/ip-lookup?ip=${encodeURIComponent(query)}`}>{d.toolNames["ip-lookup"]}<ArrowUpRight size={14} /></Link></div>}<div className="section-heading"><div><div className="section-kicker">{d.searchPage.results}</div><h2>{query || d.nav.tools}</h2></div></div>{matchingTools.length === 0 && matchingPosts.length === 0 ? <div className="empty-state">{d.searchPage.noResults}</div> : <><div className="tools-grid">{matchingTools.map((tool) => <ToolCard key={tool.slug} tool={tool} locale={lang} />)}</div>{matchingPosts.length > 0 && <div style={{ marginTop: 36 }}><div className="section-heading"><div><div className="section-kicker">{d.nav.blog}</div><h2>{d.searchPage.results}</h2></div></div><div className="article-grid">{matchingPosts.map((post) => <Link key={post.slug} className="article-card" href={`/${lang}/blog/${post.slug}`}><div className="article-cover"><ArrowUpRight size={24} /></div><div className="article-content"><span className="article-category">{post.translations[lang].category}</span><h3>{post.translations[lang].title}</h3><p>{post.translations[lang].excerpt}</p></div></Link>)}</div></div>}</>}</section></>;
}
