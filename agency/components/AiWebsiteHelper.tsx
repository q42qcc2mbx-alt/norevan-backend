"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Loader2, Sparkles, WandSparkles } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// KI-Texthilfe (from the starter kit, adapted): describe your website, pick a
// focus, and get concrete, copy-ready improvement text — one click to copy.

const FOCUS: { id: string; label: string }[] = [
  { id: "allgemein", label: "Allgemein" },
  { id: "texte", label: "Texte / Copywriting" },
  { id: "seo", label: "SEO" },
  { id: "design", label: "Design / UX" },
  { id: "conversion", label: "Mehr Verkäufe" },
  { id: "ueber-uns", label: "Über-uns-Text" },
];

export default function AiWebsiteHelper() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("allgemein");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() && !url.trim()) {
      setError("Bitte beschreiben Sie Ihre Website oder geben Sie eine URL ein.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Bitte loggen Sie sich erneut ein.");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, description, focus }),
      });
      const payload = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !payload.text) throw new Error(payload.error ?? "KI nicht erreichbar.");
      setResult(payload.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "KI nicht erreichbar.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Input */}
      <form onSubmit={generate} className="card-elevated p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <WandSparkles className="h-4.5 w-4.5 text-accent" />
          Website verbessern (KI-Texthilfe)
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Beschreiben Sie Ihre Website — die KI schreibt Ihnen konkrete
          Verbesserungen zum Kopieren.
        </p>

        <label htmlFor="ai-url" className="mt-5 mb-1.5 block text-sm font-medium text-ink">
          Website-URL <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          id="ai-url"
          type="text"
          inputMode="url"
          maxLength={300}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ihre-website.de"
          className="field"
        />

        <label htmlFor="ai-desc" className="mt-4 mb-1.5 block text-sm font-medium text-ink">
          Beschreibung / aktueller Text
        </label>
        <textarea
          id="ai-desc"
          rows={5}
          maxLength={4000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Was ist Ihre Website? Was möchten Sie verbessern? (z. B. Café in Berlin, die Startseite wirkt langweilig)"
          className="field resize-none"
        />

        <span className="mt-4 mb-1.5 block text-sm font-medium text-ink">Fokus</span>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFocus(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                focus === f.id
                  ? "border-accent bg-accent text-white"
                  : "border-edge bg-surface text-ink-soft hover:border-accent/40 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              KI denkt nach …
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5" />
              Verbesserungen generieren
            </>
          )}
        </button>
      </form>

      {/* Output */}
      <div className="card-elevated flex min-h-[320px] flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">Vorschlag der KI</h3>
          {result && (
            <button
              type="button"
              onClick={copy}
              className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Kopiert
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Kopieren
                </>
              )}
            </button>
          )}
        </div>

        {!result && !loading && (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-ink-muted" />
              <p className="mt-2 text-sm text-ink-muted">
                Ihr Verbesserungs-Text erscheint hier.
              </p>
            </div>
          </div>
        )}
        {loading && (
          <p className="mt-6 animate-pulse text-sm text-ink-muted">Generiere Vorschlag …</p>
        )}
        {result && (
          <pre className="mt-4 max-h-[460px] overflow-y-auto font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
