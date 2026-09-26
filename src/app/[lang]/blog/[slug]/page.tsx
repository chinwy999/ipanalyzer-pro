import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Clock3, Share2 } from "lucide-react";
import { PageIntro } from "@/components/shared/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { ToolCard } from "@/components/shared/tool-card";
import { blogPosts, findPost } from "@/data/blog-posts";
import { isLocale, siteConfig } from "@/config/site";
import { tools } from "@/config/tools";
import { getDictionary } from "@/lib/i18n";
import { socialMetadata } from "@/lib/seo";

export async function generateStaticParams() { return blogPosts.map((post) => ({ slug: post.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; if (!isLocale(lang)) return {}; const post = findPost(slug); if (!post) return {};
  const d = getDictionary(lang); const item = post.translations[lang]; const path = `/blog/${slug}`; const languages: Record<string, string> = { en: `/en${path}`, ar: `/ar${path}`, fr: `/fr${path}`, "x-default": `/en${path}` };
  return { title: item.title, description: item.excerpt, keywords: [item.category, "IP", "network guide"], alternates: { canonical: `/${lang}${path}`, languages }, ...socialMetadata(lang, item.title, item.excerpt, path, "article"), robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params; if (!isLocale(lang)) notFound(); const post = findPost(slug); if (!post) notFound(); const d = getDictionary(lang); const item = post.translations[lang]; const url = `${siteConfig.url}/${lang}/blog/${slug}`;
  const related = blogPosts.filter((other) => other.slug !== post.slug && other.relatedTools.some((tool) => post.relatedTools.includes(tool))).slice(0, 2);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.excerpt, datePublished: post.publishedAt, dateModified: post.publishedAt, inLanguage: lang, author: { "@type": "Organization", name: d.appName }, publisher: { "@type": "Organization", name: d.appName }, mainEntityOfPage: url, image: `${siteConfig.url}/images/og-image.svg` };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: item.faq.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: d.nav.home, item: `${siteConfig.url}/${lang}` }, { "@type": "ListItem", position: 2, name: d.nav.blog, item: `${siteConfig.url}/${lang}/blog` }, { "@type": "ListItem", position: 3, name: item.title, item: url }] };
  return <><JsonLd data={schema} /><JsonLd data={faqSchema} /><JsonLd data={breadcrumb} /><PageIntro locale={lang} kicker={item.category} title={item.title} description={item.excerpt} items={[{ label: d.nav.blog, href: `/${lang}/blog` }, { label: item.title }]}><div className="article-meta"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CalendarDays size={13} />{d.blog.published} · {post.publishedAt}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Clock3 size={13} />{post.minutes} {d.blog.readTime}</span></div></PageIntro>
    <section className="container-shell section-tight"><div className="article-layout"><article className="article-body"><p className="article-lead">{item.lead}</p>{item.sections.map((section, index) => <section key={section.heading} id={`section-${index + 1}`}><h2>{section.heading}</h2><p>{section.body}</p></section>)}<div className="article-callout">{item.conclusion}</div><h2>{d.blog.faq}</h2><div className="faq-list">{item.faq.map((faq) => <details className="faq-item" key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div><div className="form-actions" style={{ marginTop: 24 }}><span className="text-link"><Share2 size={14} />{d.blog.share}</span><a className="btn-secondary" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a><a className="btn-secondary" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(item.title)}`} target="_blank" rel="noreferrer">X <ArrowUpRight size={12} /></a></div><Link className="text-link" href={`/${lang}/blog`} style={{ marginTop: 22 }}><ArrowLeft size={14} />{d.blog.back}</Link></article><aside className="article-aside"><h3><BookOpen size={14} style={{ verticalAlign: "-2px", marginInlineEnd: 6 }} />{d.blog.contents}</h3>{item.sections.map((section, index) => <a key={section.heading} href={`#section-${index + 1}`}>{section.heading}</a>)}<a href="#related">{d.blog.related}</a><a href="#related-tools">{d.nav.tools}</a></aside></div></section>
    <section id="related" className="container-shell section-tight"><div className="section-heading"><div><div className="section-kicker">{d.nav.blog}</div><h2>{d.blog.related}</h2></div></div><div className="article-grid">{related.map((other) => <Link className="article-card" href={`/${lang}/blog/${other.slug}`} key={other.slug}><div className="article-cover"><BookOpen size={26} /></div><div className="article-content"><span className="article-category">{other.translations[lang].category}</span><h3>{other.translations[lang].title}</h3><p>{other.translations[lang].excerpt}</p></div></Link>)}</div></section>
    <section id="related-tools" className="container-shell section-tight"><div className="section-heading"><div><div className="section-kicker">{d.nav.tools}</div><h2>{d.blog.related}</h2></div></div><div className="tools-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}>{post.relatedTools.map((toolSlug) => { const tool = tools.find((candidate) => candidate.slug === toolSlug); return tool ? <ToolCard key={toolSlug} locale={lang} tool={tool} /> : null; })}</div></section>
  </>;
}
