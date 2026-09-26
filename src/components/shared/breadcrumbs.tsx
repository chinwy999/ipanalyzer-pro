import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: { label: string; href?: string }[] }) {
  const d = getDictionary(locale);
  const all = [{ label: d.nav.home, href: `/${locale}` }, ...items];
  return (
    <nav className="breadcrumb" aria-label={d.nav.home}>
      {all.map((item, index) => (
        <span key={`${item.label}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
          {item.href && index < all.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
