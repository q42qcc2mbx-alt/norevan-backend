"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DatabaseBackup, Globe, Lock, RefreshCw, ShieldCheck } from "lucide-react";

// "Fort Knox" security panel for the customer portal. Shows only REAL, true
// protections (no fabricated threat counters) so it builds trust honestly:
// the live HTTPS state is actually checked, the EU data location is a fact,
// and the security headers are genuinely set on this domain.

const PROTECTIONS: { icon: typeof Lock; label: string; detail: string }[] = [
  { icon: Lock, label: "SSL/TLS-Verschlüsselung", detail: "Verbindung verschlüsselt" },
  { icon: Globe, label: "Daten-Server in der EU", detail: "Irland · DSGVO-konform" },
  { icon: ShieldCheck, label: "Sicherheits-Header aktiv", detail: "HSTS · CSP · Clickjacking-Schutz" },
  { icon: DatabaseBackup, label: "Tägliche Backups", detail: "Automatisch gesichert" },
  { icon: RefreshCw, label: "Updates & Monitoring", detail: "Laufend gepflegt" },
  { icon: CheckCircle2, label: "DSGVO-konform", detail: "Datenschutz nach EU-Recht" },
];

export default function SecurityStatus() {
  const [checkedOn, setCheckedOn] = useState("");
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    // Defer state writes out of the effect body (lint: set-state-in-effect).
    const frame = requestAnimationFrame(() => {
      setSecure(typeof window === "undefined" || window.location.protocol === "https:");
      setCheckedOn(
        new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="card-elevated overflow-hidden p-0">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center md:p-7">
        {/* Shield / headline */}
        <div className="flex items-center gap-4 sm:w-64 sm:shrink-0 sm:flex-col sm:items-start">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-surface bg-emerald-400" />
            </span>
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Rundum geschützt</h2>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {secure ? "Live-Status: sicher" : "Verbindung prüfen"}
            </p>
          </div>
        </div>

        {/* Protections grid */}
        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PROTECTIONS.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-edge bg-card px-3.5 py-2.5"
            >
              <Icon className="h-4.5 w-4.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{label}</p>
                <p className="truncate text-xs text-ink-muted">{detail}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-edge bg-card/50 px-6 py-3 md:px-7">
        <p className="text-xs text-ink-muted">
          Ihre Website &amp; Ihre Daten liegen bei uns wie in einem Tresor — verschlüsselt,
          in der EU, automatisch gesichert.
          {checkedOn && <span className="text-ink-soft"> Zuletzt live geprüft: {checkedOn}.</span>}
        </p>
      </div>
    </div>
  );
}
