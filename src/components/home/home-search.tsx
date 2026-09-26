"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";

export function HomeSearch({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [value, setValue] = useState("");
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/${locale}/tools/ip-lookup${value.trim() ? `?ip=${encodeURIComponent(value.trim())}` : ""}`);
  }
  return (
    <>
      <form className="search-panel" onSubmit={submit}>
        <Search className="search-icon" size={18} aria-hidden="true" />
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={d.hero.placeholder} aria-label={d.toolPage.input} autoComplete="off" />
        <button className="btn-primary" type="submit">{d.hero.button}<ArrowRight size={15} /></button>
      </form>
      <div className="hero-trust"><ShieldCheck size={14} />{d.hero.trust}</div>
    </>
  );
}
