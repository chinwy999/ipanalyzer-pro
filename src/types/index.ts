import type { ToolSlug } from "@/config/tools";
import type { IpInfo } from "@/services/ip-service";

export type { IpInfo, ToolSlug };
export type HistoryEntry = { ip: string; label?: string; savedAt: string; info?: IpInfo };
export type BulkResult = { ip: string; country: string | null; city: string | null; isp: string | null; asn: string | null; valid: boolean; error?: string };
