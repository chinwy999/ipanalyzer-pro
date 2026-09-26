import { NextRequest, NextResponse } from "next/server";
import { isValidIp } from "@/lib/validators";
import { isPublicIp } from "@/lib/ip-network";
import type { IpInfo } from "@/services/ip-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyRecord = Record<string, unknown>;
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" ? String(value) : null; }
function number(value: unknown): number | null { if (value === null || value === undefined || value === "") return null; const parsed = typeof value === "number" ? value : Number(value); return Number.isFinite(parsed) ? parsed : null; }
function truth(value: unknown): boolean | null { return typeof value === "boolean" ? value : typeof value === "number" ? value === 1 : null; }

async function getJson(url: string): Promise<AnyRecord> {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "IPAnalyzer-Pro/1.0" }, signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return await response.json() as AnyRecord;
}

async function identify(ip: string, security: boolean): Promise<IpInfo> {
  const selected = (process.env.IP_GEO_API_PROVIDER || "ipapi.co").toLowerCase();
  let raw: AnyRecord | null = null;
  let providerName = "ipapi.co";
  if (selected.includes("ipwho")) {
    providerName = "ipwho.is";
    raw = await getJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
    if (raw.success === false) throw new Error("No IP data available");
  } else if (selected.includes("ip-api")) {
    providerName = "ip-api.com";
    raw = await getJson(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,query,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,continent`);
    if (raw.status === "fail") throw new Error(text(raw.message) || "IP lookup failed");
  } else {
    raw = await getJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
    if (raw.error === true || raw.reason) throw new Error(text(raw.reason) || "IP lookup failed");
  }

  const connection = (raw.connection && typeof raw.connection === "object" ? raw.connection : {}) as AnyRecord;
  const securityData = (raw.security && typeof raw.security === "object" ? raw.security : {}) as AnyRecord;
  let flags = { vpn: truth(securityData.vpn), proxy: truth(securityData.proxy), tor: truth(securityData.tor), hosting: truth(securityData.hosting), type: text(connection.type) || text(raw.type), proxyType: text(securityData.proxy_type) || text(raw.proxy_type), confidence: number(securityData.confidence) };
  if (security && !flags.vpn && !flags.proxy && !flags.tor && !flags.hosting) {
    try {
      const enriched = await getJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
      const extra = (enriched.security && typeof enriched.security === "object" ? enriched.security : {}) as AnyRecord;
      const extraConnection = (enriched.connection && typeof enriched.connection === "object" ? enriched.connection : {}) as AnyRecord;
      flags = { vpn: truth(extra.vpn), proxy: truth(extra.proxy), tor: truth(extra.tor), hosting: truth(extra.hosting), type: text(extraConnection.type) || flags.type, proxyType: text(extra.proxy_type) || text(enriched.proxy_type) || flags.proxyType, confidence: number(extra.confidence) };
    } catch { /* classification remains unknown when the optional source is unavailable */ }
  }
  const rawIp = text(raw.ip) || text(raw.query) || ip;
  const country = text(raw.country_name) || text(raw.country) || text(raw.countryName);
  const asnText = text(raw.asn) || text(raw.as) || text(connection.asn);
  const asName = text(raw.asname) || text(raw.as_name) || text(connection.org) || text(raw.org);
  return {
    ip: rawIp,
    version: raw.version === "IPv6" || rawIp.includes(":") ? 6 : 4,
    country,
    countryCode: text(raw.country_code) || text(raw.countryCode),
    region: text(raw.region) || text(raw.regionName),
    city: text(raw.city),
    postal: text(raw.postal) || text(raw.zip),
    latitude: number(raw.latitude ?? raw.lat),
    longitude: number(raw.longitude ?? raw.lon),
    timezone: text(raw.timezone) || (raw.timezone && typeof raw.timezone === "object" ? text((raw.timezone as AnyRecord).id) : null),
    isp: text(raw.org) || text(raw.isp) || text(connection.isp),
    organization: text(raw.org) || text(connection.org),
    asn: asnText?.startsWith("AS") ? asnText : asnText ? `AS${asnText}` : null,
    asName,
    continent: text(raw.continent_code) || text(raw.continent),
    security: { ...flags, type: flags.type || providerName },
  };
}

async function getVisitorIp(request: NextRequest): Promise<string | null> {
  const candidate = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (candidate && isValidIp(candidate) && isPublicIp(candidate)) return candidate;
  try {
    const response = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(5000), cache: "no-store" });
    const data = await response.json() as { ip?: string };
    return data.ip && isValidIp(data.ip) ? data.ip : null;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const provided = request.nextUrl.searchParams.get("ip")?.trim();
  const ip = provided || await getVisitorIp(request);
  if (!ip || !isValidIp(ip)) return NextResponse.json({ error: "INVALID_IP" }, { status: 400 });
  try {
    const result = await identify(ip, request.nextUrl.searchParams.get("security") === "1");
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ error: "LOOKUP_FAILED", message: "No data could be returned by the configured provider." }, { status: 502 });
  }
}
