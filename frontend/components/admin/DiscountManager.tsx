"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createDiscountAction,
  toggleDiscountAction,
  type DiscountState,
} from "@/app/admin/_actions/discounts";
import type { DiscountCode } from "@/lib/discounts";

const inputCls =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none";

export function DiscountManager({ initial }: { initial: DiscountCode[] }) {
  const [state, formAction, pending] = useActionState<DiscountState, FormData>(
    createDiscountAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-10">
      <div className="rounded-md border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Code anlegen
        </div>
        <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="code" placeholder="CODE z. B. WELCOME10" className={inputCls} />
          <select name="type" defaultValue="percent" className={inputCls}>
            <option value="percent">Prozent (%)</option>
            <option value="fixed">Betrag (€)</option>
          </select>
          <input name="value" type="number" step="1" min="1" placeholder="Wert (10 = 10% / 10€)" className={inputCls} />
          <input name="minSubtotal" type="number" step="0.01" min="0" placeholder="Mindestbestellwert € (optional)" className={inputCls} />
          <input name="maxUses" type="number" step="1" min="1" placeholder="Max. Nutzungen (optional)" className={inputCls} />
          <input name="expiresAt" type="date" className={inputCls} />
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "…" : "Anlegen"}
          </button>
        </form>
        {state && !state.ok && <p className="mt-3 font-mono text-[10px] text-red-400">{state.error}</p>}
        {state?.ok && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">Gespeichert ✓</p>
        )}
      </div>

      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border-subtle px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Codes · {initial.length}
        </div>
        <ul className="divide-y divide-border-subtle">
          {initial.map((d) => (
            <li key={d.code} className="flex flex-wrap items-center gap-3 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm text-foreground">
                  {d.code}{" "}
                  <span className="text-muted">
                    · {d.type === "percent" ? `${d.value}%` : `${(d.value / 100).toFixed(2)} €`}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-muted">
                  {d.used_count}{d.max_uses != null ? `/${d.max_uses}` : ""} genutzt
                  {d.min_subtotal_cents > 0 ? ` · ab ${(d.min_subtotal_cents / 100).toFixed(2)} €` : ""}
                  {d.expires_at ? ` · bis ${new Date(d.expires_at).toLocaleDateString("de-DE")}` : ""}
                </div>
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.2em] ${d.active ? "text-[var(--gold)]" : "text-muted"}`}
              >
                {d.active ? "aktiv" : "inaktiv"}
              </span>
              <form action={toggleDiscountAction}>
                <input type="hidden" name="code" value={d.code} />
                <input type="hidden" name="active" value={(!d.active).toString()} />
                <button
                  type="submit"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
                >
                  {d.active ? "Deaktivieren" : "Aktivieren"}
                </button>
              </form>
            </li>
          ))}
          {initial.length === 0 && (
            <li className="px-6 py-6 text-sm text-muted">Noch keine Codes.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
