"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createMemberAction,
  updateRoleAction,
  revokeAction,
  type CreateState,
} from "@/app/admin/_actions/team";
import type { TeamMember } from "@/lib/team";

const ROLES = ["viewer", "staff", "admin", "owner"] as const;

const ROLE_LABEL: Record<string, string> = {
  owner: "Inhaber",
  admin: "Admin",
  staff: "Mitarbeiter",
  viewer: "Leser",
  customer: "Kunde",
};

export function TeamManager({
  initialMembers,
  currentUserId,
}: {
  initialMembers: TeamMember[];
  currentUserId: number;
}) {
  const [state, formAction, pending] = useActionState<CreateState, FormData>(
    createMemberAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the inputs after a successful create (keep the credentials banner).
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-10">
      {/* Create */}
      <div className="rounded-md border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Mitglied hinzufügen
        </div>

        <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-4">
          <Field name="username" placeholder="Benutzername" autoComplete="off" />
          <Field name="email" placeholder="E-Mail" type="email" autoComplete="off" />
          <select
            name="role"
            defaultValue="staff"
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-foreground font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "…" : "Anlegen"}
          </button>
        </form>

        {state && !state.ok && (
          <p className="mt-3 font-mono text-[10px] text-red-400">{state.error}</p>
        )}
        {state?.ok && <Credentials email={state.email} password={state.tempPassword} />}
      </div>

      {/* Members */}
      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border-subtle px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Team · {initialMembers.length}
        </div>
        <ul className="divide-y divide-border-subtle">
          {initialMembers.map((m) => {
            const isSelf = m.id === currentUserId;
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">
                    {m.username}{" "}
                    {isSelf && <span className="text-muted">(du)</span>}
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted">{m.email}</div>
                </div>

                <form action={updateRoleAction} className="flex items-center">
                  <input type="hidden" name="id" value={m.id} />
                  <select
                    name="role"
                    defaultValue={m.role}
                    disabled={isSelf}
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    className="h-9 rounded-lg border border-border bg-background px-2 font-mono text-[10px] uppercase tracking-[0.15em] focus:border-foreground focus:outline-none disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </form>

                {!isSelf && (
                  <RevokeButton id={m.id} />
                )}
              </li>
            );
          })}
          {initialMembers.length === 0 && (
            <li className="px-6 py-6 text-sm text-muted">Noch keine Mitglieder.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
  autoComplete,
}: {
  name: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="h-11 rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
    />
  );
}

function Credentials({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 rounded-md border border-foreground/30 bg-background-soft p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Konto angelegt — Zugangsdaten einmalig:
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm">
        <span className="text-muted">
          E-Mail: <span className="text-foreground">{email}</span>
        </span>
        <span className="text-muted">
          Passwort: <span className="text-foreground">{password}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(`${email} / ${password}`).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            },
            () => {},
          );
        }}
        className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        {copied ? "Kopiert ✓" : "Kopieren"}
      </button>
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted">
        Eine Einladungs-Mail mit Login-Link und diesem Passwort wurde an{" "}
        {email} gesendet.
      </p>
    </div>
  );
}

function RevokeButton({ id }: { id: number }) {
  return (
    <form action={revokeAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-red-400"
      >
        Entfernen
      </button>
    </form>
  );
}
