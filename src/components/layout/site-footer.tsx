import Link from "next/link";
import { Activity } from "lucide-react";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import { tools } from "@/config/tools";

export function SiteFooter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const legalLinks = [
    ["privacy", d.legal.privacy], ["terms", d.legal.terms], ["disclaimer", d.legal.disclaimer], ["cookies", d.legal.cookies],
  ];
  return (
    <footer className="site-footer">
      <div className="container-shell footer-main">
        <div className="footer-about">
          <Link className="brand" href={`/${locale}`}>
            <span className="brand-mark"><Activity size={18} /></span>
            <span className="brand-name">IPAnalyzer <span>Pro</span></span>
          </Link>
          <p>{d.footer.about}</p>
        </div>
        <div className="footer-column"><h3>{d.footer.tools}</h3>{tools.map((tool) => <Link key={tool.slug} href={`/${locale}/tools/${tool.slug}`}>{d.toolNames[tool.slug]}</Link>)}<Link href={`/${locale}/tools`}>{d.home.allTools}</Link></div>
        <div className="footer-column"><h3>{d.footer.company}</h3><Link href={`/${locale}/about`}>{d.nav.about}</Link><Link href={`/${locale}/contact`}>{d.nav.contact}</Link><Link href={`/${locale}/blog`}>{d.nav.blog}</Link><Link href={`/${locale}/search`}>{d.nav.search}</Link></div>
        <div className="footer-column"><h3>{d.footer.legal}</h3>{legalLinks.map(([slug, label]) => <Link key={slug} href={`/${locale}/legal/${slug}`}>{label}</Link>)}</div>
      </div>
      <div className="container-shell footer-bottom"><span>© {new Date().getFullYear()} IPAnalyzer Pro. {d.footer.copyright}</span><span>{d.footer.disclaimer}</span></div>
    </footer>
  );
}
