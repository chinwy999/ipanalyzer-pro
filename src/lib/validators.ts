import { z } from "zod";

export function isValidIPv4(value: string): boolean {
  const parts = value.trim().split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

export function ipv6ToBigInt(value: string): bigint | null {
  const input = value.trim().toLowerCase().split("%")[0];
  if (!input || input.includes(":::")) return null;
  let source = input;
  if (source.includes(".")) {
    const lastColon = source.lastIndexOf(":");
    if (lastColon < 0 || !isValidIPv4(source.slice(lastColon + 1))) return null;
    const octets = source.slice(lastColon + 1).split(".").map(Number);
    const hex = `${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
    source = `${source.slice(0, lastColon + 1)}${hex}`;
  }
  const halves = source.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  if (left.some((group) => !/^[\da-f]{1,4}$/.test(group)) || right.some((group) => !/^[\da-f]{1,4}$/.test(group))) return null;
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;
  const groups = [...left, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...right];
  if (groups.length !== 8) return null;
  return groups.reduce((acc, group) => (acc << BigInt(16)) | BigInt(`0x${group || "0"}`), BigInt(0));
}

export function isValidIPv6(value: string): boolean {
  return ipv6ToBigInt(value) !== null;
}

export function isValidIp(value: string): boolean {
  const ip = value.trim();
  return isValidIPv4(ip) || isValidIPv6(ip);
}

export const lookupIpSchema = z.object({ ip: z.string().trim().min(1).max(100).refine(isValidIp, "Invalid IP address") });
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
});
