"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/i18n";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ lang: string }>();
  const locale = params.lang === "ar" || params.lang === "fr" ? params.lang : "en";
  const d = getDictionary(locale);
  return <section className="container-shell not-found"><div className="not-found-card"><span className="not-found-code">500 · IPANALYZER PRO</span><h1>{d.errors.serverTitle}</h1><p>{d.errors.serverText}</p><div className="form-actions" style={{ justifyContent: "center" }}><button className="btn-primary" onClick={reset}>{d.toolPage.run}</button><Link className="btn-secondary" href={`/${locale}`}>{d.errors.home}</Link></div></div></section>;
}
