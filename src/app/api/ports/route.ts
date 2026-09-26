import { NextRequest, NextResponse } from "next/server";
import net from "node:net";
import { lookup } from "node:dns/promises";
import { isValidIp } from "@/lib/validators";
import { isPublicIp } from "@/lib/ip-network";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const knownServices: Record<number, string> = { 20: "FTP data", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 465: "SMTPS", 587: "SMTP submission", 993: "IMAPS", 995: "POP3S", 1433: "MS SQL", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 5900: "VNC", 8080: "HTTP alternate" };
const commonPorts = [21, 22, 25, 53, 80, 110, 143, 443, 445, 587, 993, 1433, 3306, 3389, 5432, 5900, 8080];

function checkPort(host: string, port: number): Promise<"open" | "closed" | "filtered"> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (status: "open" | "closed" | "filtered") => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(status);
    };
    socket.setTimeout(1200);
    socket.once("connect", () => finish("open"));
    socket.once("timeout", () => finish("filtered"));
    socket.once("error", (error: NodeJS.ErrnoException) => finish(error.code === "ECONNREFUSED" ? "closed" : "filtered"));
    socket.connect(port, host);
  });
}

export async function POST(request: NextRequest) {
  let body: { target?: string; ports?: number[] };
  try { body = await request.json() as { target?: string; ports?: number[] }; }
  catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const target = body.target?.trim() || "";
  let host = target;
  if (!isValidIp(target)) {
    if (target.length > 253 || !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/.test(target)) return NextResponse.json({ error: "INVALID_TARGET" }, { status: 400 });
    try { host = (await lookup(target)).address; } catch { return NextResponse.json({ error: "TARGET_NOT_FOUND" }, { status: 400 }); }
  }
  if (!isPublicIp(host)) return NextResponse.json({ error: "PUBLIC_ADDRESS_REQUIRED" }, { status: 400 });
  const requested = Array.isArray(body.ports) ? body.ports : commonPorts;
  const ports = [...new Set(requested)].filter((port) => Number.isInteger(port) && port >= 1 && port <= 65535).slice(0, 20);
  if (!ports.length) return NextResponse.json({ error: "NO_PORTS" }, { status: 400 });
  const results = await Promise.all(ports.map(async (port) => ({ port, service: knownServices[port] || "Unknown", status: await checkPort(host, port) })));
  return NextResponse.json({ target, results, checked: results.length });
}
