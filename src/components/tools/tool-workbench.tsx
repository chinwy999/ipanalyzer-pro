"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar, enUS, fr } from "date-fns/locale";
import { AlertTriangle, ArrowDownToLine, ArrowUpRight, Download, ExternalLink, Globe2, MapPin, Trash2 } from "lucide-react";
import { fetchIpInfo } from "@/lib/ip-api";
import type { BulkResult, HistoryEntry } from "@/types";
import type { Locale } from "@/config/site";
import type { ToolSlug } from "@/config/tools";
import { getDictionary } from "@/lib/i18n";
import { isValidIp, isValidIPv4 } from "@/lib/validators";
import { calculateRange, convertIpv4ToIpv6 } from "@/lib/ip-network";
import { localePath } from "@/lib/utils";

const LeafletMap = dynamic(() => import("@/components/tools/leaflet-map").then((module) => module.LeafletMap), { ssr: false, loading: () => <div className="map-frame" style={{ display: "grid", placeItems: "center", color: "#8d9bb1", fontSize: 12 }}>…</div> });
const HISTORY_KEY = "ipanalyzer-ip-history-v1";

function Field({ label, value, emphasis = false }: { label: string; value: string | number | null | undefined; emphasis?: boolean }) {
  return <div className={`result-cell${emphasis ? " emphasis" : ""}`}><span className="label">{label}</span><span className="value">{value === null || value === undefined || value === "" ? "—" : String(value)}</span></div>;
}

function LoadingLine({ text }: { text: string }) {
  return <div className="loading-line"><span className="spinner" aria-hidden="true" />{text}</div>;
}

function StatusPill({ value, labels }: { value: boolean | null | undefined; labels: { yes: string; no: string; unknown: string } }) {
  const state = value === true ? "good" : value === false ? "bad" : "unknown";
  return <span className={`status-pill ${state}`}>{value === true ? labels.yes : value === false ? labels.no : labels.unknown}</span>;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ToolWorkbench({ locale, slug, initialIp }: { locale: Locale; slug: ToolSlug; initialIp?: string }) {
  const d = getDictionary(locale);
  const t = d.toolPage;
  const [ip, setIp] = useState(initialIp || "");
  const [submittedIp, setSubmittedIp] = useState<string | null>(initialIp?.trim() ? initialIp.trim() : null);
  const [inputError, setInputError] = useState("");
  const [notice, setNotice] = useState("");
  const securityMode = slug === "vpn-detector" || slug === "proxy-checker";
  const usesIpLookup = ["ip-lookup", "geolocation", "vpn-detector", "proxy-checker"].includes(slug);
  const lookupEnabled = usesIpLookup && submittedIp !== null && (submittedIp === "__visitor__" || isValidIp(submittedIp));
  const lookup = useQuery({
    queryKey: ["ip-lookup", submittedIp || "idle", securityMode],
    queryFn: () => fetchIpInfo(submittedIp === "__visitor__" ? undefined : submittedIp || undefined, securityMode),
    enabled: lookupEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const historySavedFor = useRef("");
  useEffect(() => {
    if (slug === "ip-lookup" && !initialIp?.trim() && submittedIp === null) setSubmittedIp("__visitor__");
  }, [slug, initialIp, submittedIp]);

  useEffect(() => {
    if (!lookup.data || lookup.data.ip === historySavedFor.current) return;
    historySavedFor.current = lookup.data.ip;
    try {
      const previous = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as HistoryEntry[];
      const entry: HistoryEntry = { ip: lookup.data.ip, savedAt: new Date().toISOString() };
      localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...previous.filter((item) => item.ip !== entry.ip)].slice(0, 100)));
    } catch { /* local storage can be disabled by browser policy */ }
  }, [lookup.data, lookup.dataUpdatedAt]);

  function runLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = ip.trim();
    setNotice("");
    if (!isValidIp(value)) { setInputError(t.errorInvalid); return; }
    setInputError("");
    setSubmittedIp(value);
  }
  function runVisitorLookup() {
    setNotice(""); setInputError(""); setIp(""); setSubmittedIp("__visitor__");
  }

  const isLooking = lookup.isFetching;
  const ipForm = (withVisitor = true) => (
    <form onSubmit={runLookup}>
      <label className="field-label" htmlFor="ip-input">{t.input}</label>
      <input id="ip-input" className="field-input" value={ip} onChange={(event) => { setIp(event.target.value); setInputError(""); }} placeholder={t.inputPlaceholder} autoComplete="off" spellCheck={false} />
      {inputError && <p className="field-error" role="alert">{inputError}</p>}
      <div className="form-actions"><button className="btn-primary" type="submit" disabled={isLooking}>{isLooking && <span className="spinner" />}{t.lookup}</button>{withVisitor && <button className="btn-secondary" type="button" onClick={runVisitorLookup}><Globe2 size={15} />{d.hero.myIp}</button>}</div>
    </form>
  );

  const lookupResult = () => {
    if (lookup.isLoading || lookup.isFetching) return <div className="results"><LoadingLine text={t.loading} /></div>;
    if (lookup.error) return <p className="field-error" role="alert">{lookup.error.message === "NETWORK_REQUEST_FAILED" ? t.errorNetwork : t.errorGeneric}</p>;
    if (!lookup.data) return <div className="empty-state">{t.empty}</div>;
    const info = lookup.data;
    const fields: [string, string | number | null | undefined][] = [
      [t.ip, info.ip], [t.version, `IPv${info.version}`], [t.country, info.country], [t.countryCode, info.countryCode], [t.region, info.region], [t.city, info.city], [t.postal, info.postal], [t.latitude, info.latitude], [t.longitude, info.longitude], [t.timezone, info.timezone], [t.isp, info.isp], [t.organization, info.organization], [t.asn, info.asn], [t.asName, info.asName], [t.continent, info.continent],
    ];
    return <div className="results"><h3 className="results-title">{t.result}</h3><div className="result-grid">{fields.map(([label, value], index) => <Field key={label} label={label} value={value} emphasis={index === 0} />)}</div>{slug === "geolocation" && <p className="helper-text">{t.accuracy}</p>}</div>;
  };

  if (slug === "ip-lookup") return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames[slug]}</h2><p>{d.toolDescriptions[slug]}</p></div><span className="tool-icon blue"><Globe2 size={18} /></span></div><div className="workspace-body">{ipForm()}{lookupResult()}</div></div>;

  if (slug === "geolocation") {
    const info = lookup.data;
    return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames[slug]}</h2><p>{d.toolDescriptions[slug]}</p></div><span className="tool-icon violet"><MapPin size={18} /></span></div><div className="workspace-body">{ipForm()}{lookup.isFetching && <div className="results"><LoadingLine text={t.loading} /></div>}{lookup.error && <p className="field-error" role="alert">{t.errorGeneric}</p>}{info && info.latitude !== null && info.longitude !== null && <div className="results"><h3 className="results-title">{t.map}</h3><div className="map-layout"><div className="map-frame"><LeafletMap latitude={info.latitude} longitude={info.longitude} label={`${info.city || info.country || info.ip} · ${t.approx}`} /></div><aside className="map-detail"><h3>{info.city ? `${info.city}${info.country ? `, ${info.country}` : ""}` : info.country || info.ip}</h3><div className="result-grid" style={{ gridTemplateColumns: "1fr" }}><Field label={t.ip} value={info.ip} /><Field label={t.latitude} value={info.latitude} /><Field label={t.longitude} value={info.longitude} /><Field label={t.timezone} value={info.timezone} /><Field label={t.isp} value={info.isp} /></div></aside></div><p className="helper-text">{t.accuracy}</p></div>}{info && (info.latitude === null || info.longitude === null) && <p className="helper-text">{t.noData}</p>}</div></div>;
  }

  if (slug === "vpn-detector" || slug === "proxy-checker") {
    const info = lookup.data;
    const flags = info?.security;
    const isProxy = slug === "proxy-checker";
    const signal = isProxy ? flags?.proxy : flags?.vpn;
    const confidence = flags?.confidence === null || flags?.confidence === undefined ? null : Math.round(flags.confidence > 1 ? flags.confidence : flags.confidence * 100);
    const networkType = flags?.type?.toLowerCase() || "";
    const residential = networkType.includes("residential") || networkType === "isp" ? true : flags?.hosting === true ? false : null;
    return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames[slug]}</h2><p>{d.toolDescriptions[slug]}</p></div><span className={`tool-icon ${isProxy ? "cyan" : "green"}`}><Globe2 size={18} /></span></div><div className="workspace-body">{ipForm(false)}{lookup.isFetching && <div className="results"><LoadingLine text={t.loading} /></div>}{lookup.error && <p className="field-error" role="alert">{t.errorGeneric}</p>}{info && flags && <div className="results"><h3 className="results-title">{t.result}</h3><div className="result-grid"><Field label={t.ip} value={info.ip} emphasis /><Field label={t.provider} value={info.isp || info.organization} /><Field label={t.asn} value={info.asn} /><div className="result-cell"><span className="label">{isProxy ? t.proxy : t.vpn}</span><StatusPill value={signal} labels={{ yes: t.yes, no: t.no, unknown: t.unknown }} /></div>{!isProxy && <><div className="result-cell"><span className="label">{t.proxy}</span><StatusPill value={flags.proxy} labels={{ yes: t.yes, no: t.no, unknown: t.unknown }} /></div><div className="result-cell"><span className="label">{t.tor}</span><StatusPill value={flags.tor} labels={{ yes: t.yes, no: t.no, unknown: t.unknown }} /></div></>}<div className="result-cell"><span className="label">{t.hosting}</span><StatusPill value={flags.hosting} labels={{ yes: t.yes, no: t.no, unknown: t.unknown }} /></div>{isProxy && <Field label={t.proxyType} value={flags.proxyType || t.unknown} />}{!isProxy && <div className="result-cell"><span className="label">{t.residential}</span><StatusPill value={residential} labels={{ yes: t.yes, no: t.no, unknown: t.unknown }} /></div>}<Field label={t.confidence} value={confidence === null ? t.unknown : `${confidence}%`} /><Field label={t.provider} value={flags.type || t.unknown} /></div><div className="notice info"><AlertTriangle size={15} /><span>{t.estimateNotice}</span></div></div>}</div></div>;
  }

  if (slug === "ip-range-checker") return <RangeChecker locale={locale} />;
  if (slug === "reverse-dns") return <ReverseDns locale={locale} />;
  if (slug === "port-scanner") return <PortScanner locale={locale} />;
  if (slug === "ipv4-to-ipv6") return <Ipv4Converter locale={locale} />;
  if (slug === "bulk-checker") return <BulkChecker locale={locale} />;
  return <HistoryTool locale={locale} />;
}

function RangeChecker({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [mode, setMode] = useState<"cidr" | "custom">("cidr");
  const [range, setRange] = useState(""); const [start, setStart] = useState(""); const [end, setEnd] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateRange>>(null); const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const calculated = calculateRange(range, mode === "custom" ? start : undefined, mode === "custom" ? end : undefined); if (!calculated) { setError(t.errorInvalid); setResult(null); return; } setError(""); setResult(calculated); }
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["ip-range-checker"]}</h2><p>{d.toolDescriptions["ip-range-checker"]}</p></div><span className="tool-icon cyan"><ArrowDownToLine size={18} /></span></div><div className="workspace-body"><form onSubmit={submit}><label className="field-label" htmlFor="range-mode">{t.rangeMode}</label><select id="range-mode" className="field-select" value={mode} onChange={(event) => setMode(event.target.value as "cidr" | "custom")}><option value="cidr">{t.rangeMode}</option><option value="custom">{t.customRange}</option></select>{mode === "cidr" ? <div style={{ marginTop: 15 }}><label className="field-label" htmlFor="cidr-input">{t.range}</label><input id="cidr-input" className="field-input" value={range} onChange={(event) => setRange(event.target.value)} placeholder={t.rangePlaceholder} /></div> : <div className="form-row" style={{ marginTop: 15 }}><div><label className="field-label" htmlFor="range-start">{t.start}</label><input id="range-start" className="field-input" value={start} onChange={(event) => setStart(event.target.value)} placeholder="192.168.1.1" /></div><div><label className="field-label" htmlFor="range-end">{t.end}</label><input id="range-end" className="field-input" value={end} onChange={(event) => setEnd(event.target.value)} placeholder="192.168.1.254" /></div></div>}<div className="form-actions"><button className="btn-primary" type="submit">{t.analyze}</button></div>{error && <p className="field-error" role="alert">{error}</p>}</form>{result && <div className="results"><h3 className="results-title">{t.result}{mode === "cidr" ? ` · /${result.prefix}` : ""}</h3><div className="result-grid"><Field label={t.networkAddress} value={result.network} emphasis /><Field label={t.first} value={result.first} /><Field label={t.last} value={result.last} /><Field label={t.broadcast} value={result.broadcast} /><Field label={t.netmask} value={result.mask} /><Field label={t.wildcard} value={result.wildcard} /><Field label={t.total} value={Number(result.total).toLocaleString(locale)} /><Field label={t.usable} value={Number(result.usable).toLocaleString(locale)} /><Field label={t.version} value={`IPv${result.version}`} /></div></div>}</div></div>;
}

function ReverseDns({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [ip, setIp] = useState(""); const [error, setError] = useState(""); const [submitted, setSubmitted] = useState(""); const [busy, setBusy] = useState(false); const [records, setRecords] = useState<string[] | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!isValidIp(ip)) { setError(t.errorInvalid); return; } setBusy(true); setError(""); setRecords(null); setSubmitted(ip.trim()); try { const response = await fetch(`/api/dns?ip=${encodeURIComponent(ip.trim())}`); const data = await response.json() as { records?: string[] }; setRecords(data.records || []); } catch { setError(t.errorGeneric); } finally { setBusy(false); } }
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["reverse-dns"]}</h2><p>{d.toolDescriptions["reverse-dns"]}</p></div><span className="tool-icon amber"><Globe2 size={18} /></span></div><div className="workspace-body"><form onSubmit={submit}><label className="field-label" htmlFor="dns-ip">{t.input}</label><input id="dns-ip" className="field-input" value={ip} onChange={(event) => setIp(event.target.value)} placeholder={t.inputPlaceholder} />{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="btn-primary" type="submit" disabled={busy}>{busy && <span className="spinner" />}{t.run}</button></div></form>{busy && <div className="results"><LoadingLine text={t.loading} /></div>}{records && <div className="results"><h3 className="results-title">{t.ptr}</h3><div className="result-grid"><Field label={t.ip} value={submitted} emphasis /><Field label={t.hostname} value={records.length ? records.join(", ") : t.noPtr} /></div>{records.length > 0 && <div className="result-grid" style={{ marginTop: 10 }}>{records.map((record) => <Field key={record} label={t.hostname} value={record} />)}</div>}</div>}</div></div>;
}

function PortScanner({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [target, setTarget] = useState(""); const [portsText, setPortsText] = useState("22, 80, 443, 8080"); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [results, setResults] = useState<{ port: number; service: string; status: "open" | "closed" | "filtered" }[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const list = portsText.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value >= 1 && value <= 65535); if (!target.trim() || !list.length) { setError(t.errorInvalid); return; } if (list.length > 20) { setError(t.errorLimit); return; } setBusy(true); setResults([]); try { const response = await fetch("/api/ports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: target.trim(), ports: list }) }); const data = await response.json() as { results?: { port: number; service: string; status: "open" | "closed" | "filtered" }[]; error?: string }; if (!response.ok) throw new Error(data.error || "scan"); setResults(data.results || []); } catch { setError(t.scanUnavailable); } finally { setBusy(false); } }
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["port-scanner"]}</h2><p>{d.toolDescriptions["port-scanner"]}</p></div><span className="tool-icon rose"><AlertTriangle size={18} /></span></div><div className="workspace-body"><form onSubmit={submit}><label className="field-label" htmlFor="port-target">{t.target}</label><input id="port-target" className="field-input" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="8.8.8.8" /><div style={{ marginTop: 15 }}><label className="field-label" htmlFor="port-list">{t.ports}</label><input id="port-list" className="field-input" value={portsText} onChange={(event) => setPortsText(event.target.value)} placeholder={t.portsPlaceholder} /></div>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="btn-primary" type="submit" disabled={busy}>{busy && <span className="spinner" />}{t.run}</button></div></form><div className="notice"><AlertTriangle size={15} /><span>{t.securityNotice}</span></div>{busy && <div className="results"><LoadingLine text={t.loading} /></div>}{results.length > 0 && <div className="results"><h3 className="results-title">{t.result}</h3><div className="table-wrap"><table className="data-table"><thead><tr><th>{t.ports}</th><th>{t.service}</th><th>{t.status}</th></tr></thead><tbody>{results.map((item) => <tr key={item.port}><td>{item.port}</td><td>{item.service}</td><td><span className={`status-pill ${item.status === "open" ? "good" : item.status === "closed" ? "bad" : "unknown"}`}>{item.status === "open" ? t.open : item.status === "closed" ? t.closed : t.filtered}</span></td></tr>)}</tbody></table></div></div>}</div></div>;
}

function Ipv4Converter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [ip, setIp] = useState(""); const [result, setResult] = useState<ReturnType<typeof convertIpv4ToIpv6>>(null); const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const converted = convertIpv4ToIpv6(ip.trim()); if (!converted) { setError(t.errorInvalid); setResult(null); return; } setError(""); setResult(converted); }
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["ipv4-to-ipv6"]}</h2><p>{d.toolDescriptions["ipv4-to-ipv6"]}</p></div><span className="tool-icon violet"><Globe2 size={18} /></span></div><div className="workspace-body"><form onSubmit={submit}><label className="field-label" htmlFor="convert-ip">{t.input}</label><input id="convert-ip" className="field-input" value={ip} onChange={(event) => { setIp(event.target.value); if (result) setResult(null); }} placeholder="192.0.2.1" />{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="btn-primary" type="submit">{t.analyze}</button></div></form>{result && <div className="results"><h3 className="results-title">{t.result}</h3><div className="result-grid"><Field label={t.mappedCompressed} value={result.mapped} emphasis /><Field label={t.mappedExpanded} value={result.expanded} /><Field label={t.sixToFourCompressed} value={result.sixToFour} /><Field label={t.sixToFourExpanded} value={result.sixToFourExpanded} /></div><p className="helper-text">{t.ipv6Explanation}</p></div>}</div></div>;
}

function BulkChecker({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [input, setInput] = useState(""); const [results, setResults] = useState<BulkResult[]>([]); const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0); const [error, setError] = useState("");
  const totalLines = input.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).length;
  const processed = results.filter((item) => item.valid).length;
  const validCount = results.filter((item) => item.valid && !item.error).length;
  const invalidCount = results.filter((item) => !item.valid).length;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const addresses = input.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    if (addresses.length > 50) { setError(t.errorLimit); return; }
    if (!addresses.length) { setError(t.errorInvalid); return; }
    setError(""); setBusy(true); setProgress(0);
    const invalidRows: BulkResult[] = addresses.filter((address) => !isValidIp(address)).map((address) => ({ ip: address, country: null, city: null, isp: null, asn: null, valid: false }));
    const validIps = addresses.filter(isValidIp);
    let completed: BulkResult[] = [...invalidRows]; setResults(completed);
    const chunkSize = 5;
    for (let startIndex = 0; startIndex < validIps.length; startIndex += chunkSize) {
      const chunk = validIps.slice(startIndex, startIndex + chunkSize);
      const batch = await Promise.all(chunk.map(async (address): Promise<BulkResult> => {
        try { const item = await fetchIpInfo(address); return { ip: item.ip, country: item.country, city: item.city, isp: item.isp, asn: item.asn || null, valid: true }; }
        catch { return { ip: address, country: null, city: null, isp: null, asn: null, valid: true, error: t.errorGeneric }; }
      }));
      completed = [...completed, ...batch]; setResults(completed); setProgress(completed.filter((item) => item.valid).length);
    }
    if (validIps.length === 0) setProgress(0);
    setBusy(false);
  }
  function exportResults(kind: "csv" | "json") {
    const rows = results.map(({ ip, country, city, isp, asn, valid, error: rowError }) => ({ ip, country, city, isp, asn, status: !valid ? t.invalid : rowError ? t.errorGeneric : t.valid }));
    if (kind === "json") downloadFile("ip-check-results.json", JSON.stringify(rows, null, 2), "application/json;charset=utf-8");
    else { const keys = ["ip", "country", "city", "isp", "asn", "status"] as const; const csv = [keys.join(","), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n"); downloadFile("ip-check-results.csv", `\ufeff${csv}`, "text/csv;charset=utf-8"); }
  }
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["bulk-checker"]}</h2><p>{d.toolDescriptions["bulk-checker"]}</p></div><span className="tool-icon cyan"><Download size={18} /></span></div><div className="workspace-body"><form onSubmit={submit}><label className="field-label" htmlFor="bulk-list">{t.list}</label><textarea id="bulk-list" className="field-textarea" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`8.8.8.8\n1.1.1.1`} />{error && <p className="field-error" role="alert">{error}</p>}<p className="helper-text">{t.validCount}: {Math.min(totalLines, 50)} / 50</p><div className="form-actions"><button className="btn-primary" type="submit" disabled={busy}>{busy && <span className="spinner" />}{t.analyze}</button>{results.length > 0 && <><button className="btn-secondary" type="button" onClick={() => exportResults("csv")}>{t.downloadCsv}</button><button className="btn-secondary" type="button" onClick={() => exportResults("json")}>{t.downloadJson}</button></>}</div></form>{(busy || results.length > 0) && <div className="results"><h3 className="results-title">{t.result}</h3><div className="result-grid"><Field label={t.validCount} value={validCount} /><Field label={t.invalidCount} value={invalidCount} /><Field label={t.processed} value={`${progress} / ${Math.max(0, totalLines - invalidCount)}`} /></div>{busy && <div style={{ marginTop: 16 }}><div className="progress-track"><div className="progress-fill" style={{ width: `${totalLines ? (results.length / totalLines) * 100 : 0}%` }} /></div></div>}<div className="table-wrap" style={{ marginTop: 14 }}><table className="data-table"><thead><tr><th>{t.ip}</th><th>{t.country}</th><th>{t.city}</th><th>{t.isp}</th><th>{t.asn}</th><th>{t.status}</th></tr></thead><tbody>{results.map((row, index) => <tr key={`${row.ip}-${index}`}><td>{row.ip}</td><td>{row.country || "—"}</td><td>{row.city || "—"}</td><td>{row.isp || "—"}</td><td>{row.asn || "—"}</td><td><span className={`status-pill ${row.valid && !row.error ? "good" : row.valid ? "unknown" : "bad"}`}>{!row.valid ? t.invalid : row.error ? t.unknown : t.valid}</span></td></tr>)}</tbody></table></div></div>}</div></div>;
}

function HistoryTool({ locale }: { locale: Locale }) {
  const d = getDictionary(locale); const t = d.toolPage;
  const [history, setHistory] = useState<HistoryEntry[]>([]); const [ready, setReady] = useState(false);
  useEffect(() => { try { const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as HistoryEntry[]; setHistory(Array.isArray(items) ? items.filter((item) => item && typeof item.ip === "string" && typeof item.savedAt === "string") : []); } catch { setHistory([]); } finally { setReady(true); } }, []);
  function save(items: HistoryEntry[]) { setHistory(items); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch { /* storage quota or browser privacy setting */ } }
  const dateLocale = locale === "ar" ? ar : locale === "fr" ? fr : enUS;
  return <div className="workspace"><div className="workspace-head"><div><h2>{d.toolNames["ip-history"]}</h2><p>{d.toolDescriptions["ip-history"]}</p></div><span className="tool-icon amber"><ExternalLink size={18} /></span></div><div className="workspace-body"><div className="notice info"><MapPin size={15} /><span>{t.privacyNotice}</span></div>{history.length > 0 && <div className="form-actions" style={{ justifyContent: "flex-end" }}><button className="btn-secondary" type="button" onClick={() => save([])}><Trash2 size={14} />{t.clearHistory}</button></div>}{!ready ? <div className="results"><LoadingLine text={t.loading} /></div> : history.length === 0 ? <div className="empty-state">{t.emptyHistory}</div> : <div className="table-wrap" style={{ marginTop: 16 }}><table className="data-table"><thead><tr><th>{t.ip}</th><th>{t.savedAt}</th><th>{d.nav.tools}</th><th>{t.remove}</th></tr></thead><tbody>{history.map((entry) => <tr key={`${entry.ip}-${entry.savedAt}`}><td>{entry.ip}</td><td>{format(new Date(entry.savedAt), "PP · p", { locale: dateLocale })}</td><td><Link className="text-link" href={localePath(locale, `tools/ip-lookup?ip=${encodeURIComponent(entry.ip)}`)}>{t.lookup}<ArrowUpRight size={12} /></Link></td><td><button className="icon-button" type="button" aria-label={`${t.remove} ${entry.ip}`} onClick={() => save(history.filter((item) => item.ip !== entry.ip))}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}</div></div>;
}

