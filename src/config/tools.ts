import type { LucideIcon } from "lucide-react";
import { Activity, Clock3, Compass, Fingerprint, Globe2, Layers3, Network, Radar, ScanLine, Waypoints } from "lucide-react";

export type ToolSlug = "ip-lookup" | "geolocation" | "ip-range-checker" | "reverse-dns" | "port-scanner" | "vpn-detector" | "proxy-checker" | "ipv4-to-ipv6" | "bulk-checker" | "ip-history";
export type ToolConfig = { slug: ToolSlug; icon: LucideIcon; number: string; accent: string };
export const tools: ToolConfig[] = [
  { slug: "ip-lookup", icon: ScanLine, number: "01", accent: "blue" },
  { slug: "geolocation", icon: Compass, number: "02", accent: "violet" },
  { slug: "ip-range-checker", icon: Network, number: "03", accent: "cyan" },
  { slug: "reverse-dns", icon: Waypoints, number: "04", accent: "amber" },
  { slug: "port-scanner", icon: Radar, number: "05", accent: "rose" },
  { slug: "vpn-detector", icon: Fingerprint, number: "06", accent: "green" },
  { slug: "proxy-checker", icon: Activity, number: "07", accent: "blue" },
  { slug: "ipv4-to-ipv6", icon: Globe2, number: "08", accent: "violet" },
  { slug: "bulk-checker", icon: Layers3, number: "09", accent: "cyan" },
  { slug: "ip-history", icon: Clock3, number: "10", accent: "amber" },
];

export function isToolSlug(value: string): value is ToolSlug {
  return tools.some((tool) => tool.slug === value);
}
