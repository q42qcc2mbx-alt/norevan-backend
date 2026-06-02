"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTaskAction, type CreateTaskState } from "@/app/admin/_actions/tasks";
import type { Assignee } from "@/lib/tasks";

const inputCls =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none";

export function TaskCreateForm({ assignees }: { assignees: Assignee[] }) {
  const [state, formAction, pending] = useActionState<CreateTaskState, FormData>(createTaskAction, null);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Collapse + clear the form once the create action reports success.
    if (state?.ok) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-foreground px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
      >
        + Neue Aufgabe
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="rounded-md border border-border bg-card p-6">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Neue Aufgabe</div>
      <div className="grid gap-3">
        <input name="title" placeholder="Titel" className={inputCls} autoFocus />
        <textarea name="description" placeholder="Beschreibung (optional)" rows={3}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
        <div className="grid gap-3 sm:grid-cols-3">
          <select name="assigneeId" defaultValue="" className={inputCls}>
            <option value="">Nicht zugewiesen</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>{a.username} ({a.role})</option>
            ))}
          </select>
          <select name="priority" defaultValue="medium" className={inputCls}>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="urgent">Dringend</option>
          </select>
          <input name="dueDate" type="date" className={inputCls} />
        </div>
      </div>
      {state && !state.ok && <p className="mt-3 font-mono text-[10px] text-red-400">{state.error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" disabled={pending}
          className="rounded-full bg-foreground px-6 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40">
          {pending ? "…" : "Erstellen"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-full border border-border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-foreground">
          Abbrechen
        </button>
      </div>
    </form>
  );
}
