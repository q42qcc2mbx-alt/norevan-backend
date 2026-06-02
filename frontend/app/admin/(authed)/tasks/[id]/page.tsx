import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { getTask, type TaskStatus, type TaskPriority } from "@/lib/tasks";
import { setTaskStatusAction, commentTaskAction, deleteTaskAction } from "@/app/admin/_actions/tasks";

export const metadata = { title: "Aufgabe — Norevan Admin", robots: { index: false, follow: false } };

const STATUSES: { v: TaskStatus; l: string }[] = [
  { v: "todo", l: "Offen" },
  { v: "in_progress", l: "In Arbeit" },
  { v: "done", l: "Erledigt" },
  { v: "cancelled", l: "Abgebrochen" },
];
const PRIO_LABEL: Record<TaskPriority, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch", urgent: "Dringend" };

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taskId = Number(id);
  const user = await getAdminUser();
  const admin = user ? ["admin", "owner"].includes(effectiveRole(user)) : false;
  const task = await getTask(taskId);
  if (!task) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <Link href="/admin/tasks" className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground">
        ← Aufgaben
      </Link>

      <header className="mt-4 mb-6 border-b border-border pb-6">
        <h1 className="font-serif" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.5rem,3vw,2.25rem)", lineHeight: 1.1 }}>
          {task.title}
        </h1>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {task.assigneeName ?? "Nicht zugewiesen"} · {PRIO_LABEL[task.priority]}
          {task.dueDate ? ` · fällig ${new Date(task.dueDate).toLocaleDateString("de-DE")}` : ""}
        </div>
      </header>

      {task.description && (
        <p className="mb-8 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{task.description}</p>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <form action={setTaskStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={task.id} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Status</span>
          <select name="status" defaultValue={task.status}
            className="h-9 rounded-lg border border-border bg-background px-3 font-mono text-[10px] uppercase tracking-[0.15em]">
            {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
          <button type="submit" className="rounded-full bg-foreground px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-background hover:opacity-90">
            Speichern
          </button>
        </form>
        {admin && (
          <form action={deleteTaskAction} className="ml-auto">
            <input type="hidden" name="id" value={task.id} />
            <button type="submit" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-red-400">
              Löschen
            </button>
          </form>
        )}
      </div>

      <section>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Kommentare · {task.comments.length}
        </div>
        <ul className="space-y-3">
          {task.comments.map((c) => (
            <li key={c.id} className="rounded-md border border-border-subtle bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{c.authorName}</span>
                <span className="font-mono text-[9px] text-muted">
                  {new Date(c.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{c.body}</p>
            </li>
          ))}
          {task.comments.length === 0 && <li className="text-sm text-muted">Noch keine Kommentare.</li>}
        </ul>

        <form action={commentTaskAction} className="mt-4">
          <input type="hidden" name="id" value={task.id} />
          <textarea name="body" rows={2} required placeholder="Kommentar hinzufügen…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
          <button type="submit" className="mt-2 rounded-full border border-border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background">
            Senden
          </button>
        </form>
      </section>
    </div>
  );
}
