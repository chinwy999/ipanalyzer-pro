import { ipv6ToBigInt, isValidIPv4 } from "@/lib/validators";

const MAX_V4 = 0xffffffff;
export function ipv4ToNumber(ip: string): number | null {
  if (!isValidIPv4(ip)) return null;
  return ip.split(".").reduce((acc, piece) => ((acc << 8) | Number(piece)) >>> 0, 0);
}
export function numberToIpv4(value: number): string {
  const n = value >>> 0;
  return [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join(".");
}
export function formatIpv6(value: bigint, compressed = true): string {
  const groups = Array.from({ length: 8 }, (_, index) => Number((value >> BigInt((7 - index) * 16)) & BigInt(0xffff)).toString(16));
  if (!compressed) return groups.map((group) => group.padStart(4, "0")).join(":");
  let bestStart = -1;
  let bestLength = 1;
  for (let start = 0; start < groups.length;) {
    if (groups[start] !== "0") { start += 1; continue; }
    let end = start;
    while (end < groups.length && groups[end] === "0") end += 1;
    if (end - start > bestLength) { bestStart = start; bestLength = end - start; }
    start = end;
  }
  if (bestStart < 0) return groups.join(":");
  const left = groups.slice(0, bestStart).join(":");
  const right = groups.slice(bestStart + bestLength).join(":");
  return `${left}::${right}`;
}

export type RangeSummary = { version: 4 | 6; network: string; first: string; last: string; broadcast: string; mask: string; wildcard: string; total: string; usable: string; prefix: number };

export function calculateRange(input: string, startInput?: string, endInput?: string): RangeSummary | null {
  const value = input.trim();
  if (startInput || endInput) {
    const start = ipv4ToNumber(startInput ?? "");
    const end = ipv4ToNumber(endInput ?? "");
    if (start === null || end === null || start > end) return null;
    const count = end - start + 1;
    return { version: 4, network: numberToIpv4(start), first: numberToIpv4(start), last: numberToIpv4(end), broadcast: numberToIpv4(end), mask: "—", wildcard: "—", total: String(count), usable: String(count), prefix: 0 };
  }
  const [address, prefixInput, extra] = value.split("/");
  if (!address || extra !== undefined) return null;
  const prefix = Number(prefixInput);
  if (address.includes(".")) {
    const number = ipv4ToNumber(address);
    if (number === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    const mask = prefix === 0 ? 0 : (MAX_V4 << (32 - prefix)) >>> 0;
    const wildcard = (~mask) >>> 0;
    const network = (number & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const total = Math.pow(2, 32 - prefix);
    const usable = prefix >= 31 ? total : Math.max(0, total - 2);
    return { version: 4, network: numberToIpv4(network), first: numberToIpv4(prefix < 31 ? network + 1 : network), last: numberToIpv4(prefix < 31 ? broadcast - 1 : broadcast), broadcast: numberToIpv4(broadcast), mask: numberToIpv4(mask), wildcard: numberToIpv4(wildcard), total: String(total), usable: String(usable), prefix };
  }
  const parsed = ipv6ToBigInt(address);
  if (parsed === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 128) return null;
  const all = (BigInt(1) << BigInt(128)) - BigInt(1);
  const hostMask = prefix === 128 ? BigInt(0) : (BigInt(1) << BigInt(128 - prefix)) - BigInt(1);
  const mask = all ^ hostMask;
  const network = parsed & mask;
  const last = network | hostMask;
  const total = BigInt(1) << BigInt(128 - prefix);
  return { version: 6, network: formatIpv6(network), first: formatIpv6(network), last: formatIpv6(last), broadcast: "—", mask: formatIpv6(mask), wildcard: formatIpv6(hostMask), total: total.toString(), usable: total.toString(), prefix };
}

export function convertIpv4ToIpv6(ip: string): { mapped: string; expanded: string; sixToFour: string; sixToFourExpanded: string } | null {
  const value = ipv4ToNumber(ip);
  if (value === null) return null;
  const mapped = (BigInt(0xffff) << BigInt(32)) | BigInt(value);
  const sixToFour = (BigInt(0x2002) << BigInt(112)) | (BigInt(value) << BigInt(80));
  return { mapped: formatIpv6(mapped), expanded: formatIpv6(mapped, false), sixToFour: formatIpv6(sixToFour), sixToFourExpanded: formatIpv6(sixToFour, false) };
}

export function isPublicIp(ip: string): boolean {
  const v4 = ipv4ToNumber(ip);
  if (v4 !== null) {
    const first = v4 >>> 24;
    const second = (v4 >>> 16) & 255;
    const third = (v4 >>> 8) & 255;
    return !(first === 0 || first === 10 || first === 127 || first >= 224 || (first === 100 && second >= 64 && second <= 127) || (first === 169 && second === 254) || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) || (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) || (first === 203 && second === 0 && third === 113) || (first === 192 && (second === 0 || (second === 88 && third === 99))));
  }
  const v6 = ipv6ToBigInt(ip);
  if (v6 === null) return false;
  return (v6 >> BigInt(125)) === BigInt(1); // globally routable unicast 2000::/3
}
