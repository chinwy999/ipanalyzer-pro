"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n";

export default function LocaleNotFound() {
  const lang = usePathname().split("/")[1];
  const locale = lang === "ar" || lang === "fr" ? lang : "en";
  const d = getDictionary(locale);
  return <section className="container-shell not-found"><div className="not-found-card"><span className="not-found-code">404 · IPANALYZER PRO</span><h1>{d.errors.notFoundTitle}</h1><p>{d.errors.notFoundText}</p><Link className="btn-primary" href={`/${locale}`}>{d.errors.home}</Link></div></section>;
}
