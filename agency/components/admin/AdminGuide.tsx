"use client";

import { useState } from "react";
import {
  BarChart3,
  Bot,
  FileText,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Printer,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { guide, type GuideLang } from "@/lib/guide";

// In-dashboard "how your website works" guide. Trilingual (DE/EN/AR), prints
// cleanly to PDF via the browser (a print stylesheet hides the app chrome and
// lets the guide flow across pages).

const SECTION_ICONS = [
  LayoutDashboard,
  Globe,
  ScanSearch,
  BarChart3,
  MessageCircle,
  FolderKanban,
  MessageSquareText,
  Bot,
  FileText,
  ShieldCheck,
];

const LANGS: { code: GuideLang; label: string }[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

function printGuide() {
  const cleanup = () => document.body.classList.remove("printing-guide");
  document.body.classList.add("printing-guide");
  window.addEventListener("afterprint", cleanup, { once: true });
  // Fallback in case afterprint never fires (some mobile browsers).
  setTimeout(cleanup, 3000);
  window.print();
}

export default function AdminGuide() {
  const [lang, setLang] = useState<GuideLang>("de");
  const g = guide[lang];
  const rtl = lang === "ar";

  return (
    <div>
      {/* Controls — hidden when printing */}
      <div data-print-hide className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-edge bg-surface p-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                lang === l.code ? "bg-accent text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={printGuide}
          className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <Printer className="h-4 w-4" />
          {g.printLabel}
        </button>
      </div>

      {/* Printable guide */}
      <div className="print-guide" dir={rtl ? "rtl" : "ltr"}>
        <div className={`mx-auto max-w-3xl ${rtl ? "text-right" : "text-left"}`}>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-edge pb-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-glow text-white">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-ink md:text-2xl">{g.title}</h1>
              <p className="mt-0.5 text-sm text-ink-soft">{g.subtitle}</p>
            </div>
          </div>

          {/* Sections */}
          <ol className="mt-6 space-y-4">
            {g.sections.map((s, i) => {
              const Icon = SECTION_ICONS[i] ?? Inbox;
              return (
                <li
                  key={s.title}
                  className="flex gap-4 rounded-2xl border border-edge bg-surface/70 p-4 md:p-5"
                  style={{ breakInside: "avoid" }}
                >
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon className="mt-2 h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-base font-bold text-ink">{s.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-accent/[0.07] px-2.5 py-1 text-xs font-medium text-accent">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="font-bold">{g.whereLabel}</span> {s.where}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Outro */}
          <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/[0.05] p-5 text-sm leading-relaxed text-ink-soft">
            {g.outro}
          </div>
          <p className="mt-5 text-center text-xs text-ink-muted">
            NOREVAN Digital · norevan-agency.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
}
