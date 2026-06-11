"use client";

import { useState } from "react";

// THE CORE FEATURE: a customer describes their website (and optionally pastes a
// URL or their current text), picks a focus, and the AI returns concrete, ready-
// to-use improvement text the customer can copy with one click.

const FOCUS: { id: string; label: string }[] = [
  { id: "allgemein", label: "Allgemein" },
  { id: "texte", label: "Texte / Copywriting" },
  { id: "seo", label: "SEO" },
  { id: "design", label: "Design / UX" },
  { id: "conversion", label: "Mehr Verkäufe" },
  { id: "ueber-uns", label: "Über-uns-Text" },
];

export function AiWebsiteHelper() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("allgemein");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() && !url.trim()) {
      setError("Bitte beschreibe deine Website oder gib eine URL ein.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, description, focus }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "KI nicht erreichbar");
      setResult(data.text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input */}
      <form onSubmit={generate} className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Website verbessern</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Beschreibe deine Website — die KI schreibt dir konkrete Verbesserungen zum Kopieren.
        </p>

        <label className="mt-5 block text-xs font-medium text-neutral-600">Website-URL (optional)</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://deine-website.de"
          className="mt-1 h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none"
        />

        <label className="mt-4 block text-xs font-medium text-neutral-600">
          Beschreibung / aktueller Text
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Was ist deine Website? Was möchtest du verbessern? (z. B. 'Café in Berlin, Startseite wirkt langweilig')"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />

        <label className="mt-4 block text-xs font-medium text-neutral-600">Fokus</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {FOCUS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFocus(f.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                focus === f.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-11 w-full rounded-lg bg-neutral-900 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "KI denkt nach…" : "Verbesserungen generieren"}
        </button>
      </form>

      {/* Output */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vorschlag der KI</h2>
          {result && (
            <button
              type="button"
              onClick={copy}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium hover:border-neutral-900"
            >
              {copied ? "✓ Kopiert" : "Kopieren"}
            </button>
          )}
        </div>

        {!result && !loading && (
          <div className="mt-10 grid place-items-center text-center text-sm text-neutral-400">
            <div>
              <div className="text-3xl">✦</div>
              <p className="mt-2">Dein Verbesserungs-Text erscheint hier.</p>
            </div>
          </div>
        )}
        {loading && <p className="mt-6 animate-pulse text-sm text-neutral-400">Generiere Vorschlag…</p>}
        {result && (
          <pre className="mt-4 max-h-[460px] overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-800">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
