import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/config/site";
import type { ToolConfig } from "@/config/tools";
import { getDictionary } from "@/lib/i18n";

export function ToolCard({ tool, locale }: { tool: ToolConfig; locale: Locale }) {
  const d = getDictionary(locale);
  const Icon = tool.icon;
  return (
    <Link className="tool-card" href={`/${locale}/tools/${tool.slug}`}>
      <span className={`tool-icon ${tool.accent}`}><Icon size={19} strokeWidth={1.8} /></span>
      <span className="tool-number">{tool.number}</span>
      <h3>{d.toolNames[tool.slug]}</h3>
      <p>{d.toolDescriptions[tool.slug]}</p>
      <span aria-hidden="true" className="tool-open"><ArrowUpRight size={14} /></span>
    </Link>
  );
}
