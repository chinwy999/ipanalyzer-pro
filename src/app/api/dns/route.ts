import { NextRequest, NextResponse } from "next/server";
import { reverse } from "node:dns/promises";
import { isValidIp } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip")?.trim() || "";
  if (!isValidIp(ip)) return NextResponse.json({ error: "INVALID_IP" }, { status: 400 });
  try {
    const records = await Promise.race([
      reverse(ip),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DNS timeout")), 5000)),
    ]);
    return NextResponse.json({ ip, records: [...new Set(records)] });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ENOTIMP") return NextResponse.json({ ip, records: [] });
    return NextResponse.json({ ip, records: [], error: "DNS_LOOKUP_FAILED" }, { status: 200 });
  }
}
