import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import type { Locale } from "@/config/site";

export function PageIntro({ locale, title, description, kicker, items, children }: { locale: Locale; title: string; description?: string; kicker?: string; items?: { label: string; href?: string }[]; children?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="container-shell">
        {items && <Breadcrumbs locale={locale} items={items} />}
        {kicker && <p className="page-kicker">{kicker}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {children}
      </div>
    </section>
  );
}
