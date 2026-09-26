import Link from "next/link";
import { Activity, ArrowRight, BarChart3, CheckCircle2, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { HomeSearch } from "@/components/home/home-search";
import { ToolCard } from "@/components/shared/tool-card";
import { JsonLd } from "@/components/shared/json-ld";
import { tools } from "@/config/tools";
import { siteConfig, isLocale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import { blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const url = siteConfig.url;
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: d.home.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  const toolSchema = { "@context": "https://schema.org", "@type": "ItemList", name: d.home.toolsTitle, itemListElement: tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: d.toolNames[tool.slug], url: `${url}/${lang}/tools/${tool.slug}` })) };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: d.appName, url: `${url}/${lang}`, inLanguage: lang, potentialAction: { "@type": "SearchAction", target: `${url}/${lang}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  const applicationSchema = { "@context": "https://schema.org", "@type": "WebApplication", name: d.appName, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url: `${url}/${lang}`, description: d.hero.description, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };

  return (
    <>
      <JsonLd data={websiteSchema} /><JsonLd data={applicationSchema} /><JsonLd data={faqSchema} /><JsonLd data={toolSchema} />
      <section className="hero">
        <div className="container-shell hero-grid">
          <div>
            <span className="eyebrow">{d.hero.eyebrow}</span>
            <h1>{d.hero.title.split(" ").slice(0, -2).join(" ")} <span className="gradient-text">{d.hero.title.split(" ").slice(-2).join(" ")}</span></h1>
            <p className="hero-copy">{d.hero.description}</p>
            <HomeSearch locale={lang} />
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb"><span className="orbit-dot one" /><span className="orbit-dot two" /><div className="orb-core"><Globe2 size={52} strokeWidth={1.15} /></div></div>
            <div className="signal-card signal-one"><Activity size={16} /><div><strong>203.0.113.42</strong><span>{d.toolPage.ip} · IPv4</span></div></div>
            <div className="signal-card signal-two"><ShieldCheck size={16} /><div><strong>{d.toolPage.result}</strong><span>{d.toolPage.accuracy}</span></div></div>
          </div>
        </div>
      </section>

      <section className="section" id="tools">
        <div className="container-shell">
          <div className="section-heading"><div><div className="section-kicker">{d.nav.tools}</div><h2>{d.home.toolsTitle}</h2><p>{d.home.toolsSubtitle}</p></div><Link className="text-link" href={`/${lang}/tools/ip-lookup`}>{d.home.allTools}<ArrowRight size={15} /></Link></div>
          <div className="tools-grid">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} locale={lang} />)}</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container-shell">
          <div className="section-heading"><div><div className="section-kicker">{d.appName}</div><h2>{d.home.benefitsTitle}</h2><p>{d.home.benefitsSubtitle}</p></div></div>
          <div className="benefits-grid">{d.home.benefits.map((item, index) => { const Icon = [Sparkles, ShieldCheck, BarChart3][index]; return <article className="benefit-card" key={item.title}><span className="benefit-mark"><Icon size={18} /></span><h3>{item.title}</h3><p>{item.text}</p></article>; })}</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container-shell">
          <div className="section-heading"><div><div className="section-kicker">{d.home.steps.length.toString().padStart(2, "0")} · {d.appName}</div><h2>{d.home.howTitle}</h2></div></div>
          <div className="steps-grid">{d.home.steps.map((item, index) => <article className="step-card" key={item.title}><span className="step-index">0{index + 1} / 03</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container-shell">
          <div className="section-heading"><div><div className="section-kicker">{d.home.faqTitle}</div><h2>{d.home.faqTitle}</h2></div></div>
          <div className="faq-list">{d.home.faq.map((item) => <details className="faq-item" key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container-shell">
          <div className="section-heading"><div><div className="section-kicker">{d.nav.blog}</div><h2>{d.home.latestTitle}</h2><p>{d.home.latestSubtitle}</p></div><Link className="text-link" href={`/${lang}/blog`}>{d.nav.blog}<ArrowRight size={15} /></Link></div>
          <div className="article-grid">{blogPosts.slice(0, 3).map((post, index) => { const item = post.translations[lang]; const CoverIcon = [Globe2, Activity, ShieldCheck][index]; return <Link className="article-card" key={post.slug} href={`/${lang}/blog/${post.slug}`}><div className="article-cover" aria-hidden="true"><CoverIcon size={30} strokeWidth={1.25} /></div><div className="article-content"><span className="article-category">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p></div></Link>; })}</div>
        </div>
      </section>
      <section className="section section-tight"><div className="container-shell"><div className="article-callout" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><CheckCircle2 size={17} />{d.toolPage.privacyNotice}</span><Link className="text-link" href={`/${lang}/tools/ip-history`}>{d.toolNames["ip-history"]}<ArrowRight size={15} /></Link></div></div></section>
    </>
  );
}
