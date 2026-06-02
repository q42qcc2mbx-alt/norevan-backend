"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type PwState } from "@/app/admin/_actions/account";

const inputCls =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none";
const labelCls =
  "mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-muted";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<PwState, FormData>(
    changePasswordAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-sm space-y-4">
      <div>
        <label className={labelCls}>Aktuelles Passwort</label>
        <input type="password" name="currentPassword" autoComplete="current-password" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Neues Passwort</label>
        <input type="password" name="newPassword" autoComplete="new-password" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Neues Passwort wiederholen</label>
        <input type="password" name="confirm" autoComplete="new-password" className={inputCls} />
      </div>

      {state && !state.ok && (
        <p className="font-mono text-[10px] text-red-400">{state.error}</p>
      )}
      {state?.ok && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
          Passwort geändert ✓
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center rounded-full bg-foreground px-7 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Wird gespeichert…" : "Passwort ändern"}
      </button>
    </form>
  );
}
