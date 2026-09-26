import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: "DELIVERY_NOT_CONFIGURED", message: "Use the email link to complete delivery." }, { status: 503 });
  try {
    const result = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(10000) });
    if (!result.ok) return NextResponse.json({ error: "DELIVERY_FAILED" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "DELIVERY_FAILED" }, { status: 502 }); }
}
