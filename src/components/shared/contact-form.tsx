"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { contactSchema } from "@/lib/validators";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n";

type FormFields = { name: string; email: string; subject: string; message: string };
const initial: FormFields = { name: "", email: "", subject: "", message: "" };

export function ContactForm({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const c = d.contact;
  const [values, setValues] = useState<FormFields>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const address = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@yourdomain.com";
  function update(field: keyof FormFields, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setConfirmation("");
  }
  function openEmail(data: FormFields) {
    const body = `${c.name}: ${data.name}\n${c.email}: ${data.email}\n\n${data.message}`;
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({ name: fieldErrors.name?.[0] ? c.required : undefined, email: fieldErrors.email?.[0] ? c.invalidEmail : undefined, subject: fieldErrors.subject?.[0] ? c.required : undefined, message: fieldErrors.message?.[0] ? c.required : undefined });
      return;
    }
    setErrors({}); setBusy(true); setConfirmation("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json() as { error?: string };
      if (response.ok) setConfirmation(c.delivered);
      else { openEmail(parsed.data); setConfirmation(c.success); }
    } catch {
      openEmail(parsed.data); setConfirmation(c.success);
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} noValidate>
    <div className="form-row"><div><label className="field-label" htmlFor="contact-name">{c.name}</label><input id="contact-name" className="field-input" value={values.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" aria-invalid={!!errors.name} />{errors.name && <span className="field-error">{errors.name}</span>}</div><div><label className="field-label" htmlFor="contact-email">{c.email}</label><input id="contact-email" type="email" className="field-input" value={values.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" aria-invalid={!!errors.email} />{errors.email && <span className="field-error">{errors.email}</span>}</div></div>
    <div style={{ marginTop: 15 }}><label className="field-label" htmlFor="contact-subject">{c.subject}</label><input id="contact-subject" className="field-input" value={values.subject} onChange={(event) => update("subject", event.target.value)} aria-invalid={!!errors.subject} />{errors.subject && <span className="field-error">{errors.subject}</span>}</div>
    <div style={{ marginTop: 15 }}><label className="field-label" htmlFor="contact-message">{c.message}</label><textarea id="contact-message" className="field-textarea" value={values.message} onChange={(event) => update("message", event.target.value)} aria-invalid={!!errors.message} />{errors.message && <span className="field-error">{errors.message}</span>}</div>
    <p className="helper-text">{c.emailHelp}</p><div className="form-actions"><button className="btn-primary" type="submit" disabled={busy}>{busy && <span className="spinner" />}<Send size={14} />{busy ? c.sending : c.send}</button></div>
    {confirmation && <p className="article-callout" role="status" style={{ display: "flex", alignItems: "center", gap: 10 }}><CheckCircle2 size={16} />{confirmation}</p>}
  </form>;
}
