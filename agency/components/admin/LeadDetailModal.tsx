"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getSupabase } from "@/lib/supabase";
import ReportDetail from "@/components/ReportDetail";

export interface DetailRow {
  id: string;
  email: string;
  name?: string;
  website?: string | null;
  message?: string | null;
  result?: unknown;
  notes?: string | null;
}

interface Props {
  row: DetailRow | null;
  table: "agency_analyses" | "agency_leads";
  onClose: () => void;
  onSaved: () => void;
}

// Admin detail panel: full report (analyses) or the message (contact leads),
// plus an internal notes field that's saved back to the row.
export default function LeadDetailModal({ row, table, onClose, onSaved }: Props) {
  // Seeded from the row; the parent mounts this with key={row.id} so a new row
  // remounts and re-seeds the field.
  const [notes, setNotes] = useState(row?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!row) return;
    setBusy(true);
    const { error } = await getSupabase().from(table).update({ notes }).eq("id", row.id);
    setBusy(false);
    if (!error) {
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <AnimatePresence>
      {row && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl rounded-2xl border border-edge bg-surface p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold break-all text-ink">
                  {row.website || row.email}
                </h3>
                <a href={`mailto:${row.email}`} className="text-sm text-accent hover:underline">
                  {row.email}
                </a>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-card hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {row.message && (
              <p className="mb-4 rounded-xl border border-edge bg-card p-3.5 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                {row.message}
              </p>
            )}

            {row.result != null && <ReportDetail result={row.result} />}

            <form onSubmit={save} className="mt-5 border-t border-edge pt-5">
              <label htmlFor="lead-notes" className="mb-1.5 block text-sm font-semibold text-ink">
                Interne Notiz
              </label>
              <textarea
                id="lead-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nur fürs Team sichtbar — z. B. Gesprächsnotizen, nächster Schritt …"
                className="field resize-none"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notiz speichern"}
                </button>
                <a
                  href={`mailto:${row.email}`}
                  className="btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
                >
                  <Mail className="h-4 w-4" />
                  Antworten
                </a>
                {saved && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Gespeichert ✓</span>}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
