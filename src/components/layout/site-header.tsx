"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Globe2, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = [
    { href: `/${locale}`, label: d.nav.home },
    { href: `/${locale}/tools`, label: d.nav.tools },
    { href: `/${locale}/blog`, label: d.nav.blog },
    { href: `/${locale}/about`, label: d.nav.about },
    { href: `/${locale}/contact`, label: d.nav.contact },
  ];

  function changeLocale(next: string) {
    const rest = pathname.replace(/^\/(en|ar|fr)(?=\/|$)/, "");
    router.push(`/${next}${rest || ""}`);
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container-shell header-inner">
        <Link className="brand" href={`/${locale}`} aria-label={d.appName}>
          <span className="brand-mark"><Activity size={19} strokeWidth={2.4} /></span>
          <span className="brand-name">IPAnalyzer <span>Pro</span></span>
        </Link>
        <nav className={`nav-links${open ? " is-open" : ""}`} aria-label={d.nav.tools}>
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="icon-button" href={`/${locale}/search`} aria-label={d.nav.search} title={d.nav.search}><Search size={16} /></Link>
          <label className="sr-only" htmlFor="language-select">{d.nav.language}</label>
          <select id="language-select" className="language-select" value={locale} onChange={(event) => changeLocale(event.target.value)} aria-label={d.nav.language}>
            <option value="en">EN</option><option value="ar">العربية</option><option value="fr">FR</option>
          </select>
          <button className="icon-button menu-button" onClick={() => setOpen((value) => !value)} aria-label={d.nav.openMenu} aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
