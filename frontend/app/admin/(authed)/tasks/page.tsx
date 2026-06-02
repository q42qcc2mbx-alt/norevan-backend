import Link from "next/link";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { getTasks, getAssignees, type TaskStatus, type TaskPriority } from "@/lib/tasks";
import { TaskCreateForm } from "@/components/admin/TaskCreateForm";
import { cn } from "@/lib/cn";

export const metadata = { title: "Aufgaben — Norevan Admin", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Offen", in_progress: "In Arbeit", done: "Erledigt", cancelled: "Abgebrochen",
};
const PRIO_LABEL: Record<TaskPriority, string> = {
  low: "Niedrig", medium: "Mittel", high: "Hoch", urgent: "Dringend",
};
const PRIO_CLS: Record<TaskPriority, string> = {
  low: "text-muted",
  medium: "text-foreground",
  high: "text-[var(--gold)]",
  urgent: "text-red-400",
};
const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "Alle" },
  { key: "todo", label: "Offen" },
  { key: "in_progress", label: "In Arbeit" },
  { key: "done", label: "Erledigt" },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getAdminUser();
  const role = user ? effectiveRole(user) : "staff";
  const admin = role === "admin" || role === "owner";
  const sp = await searchParams;
  const status = sp?.status ?? "";

  const [tasks, assignees] = await Promise.all([
    getTasks(admin && status ? `status=${status}` : ""),
    admin ? getAssignees() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
            {admin ? "Team" : "Persönlich"}
          </span>
          <h1 className="mt-2 font-serif" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.75rem,3vw,2.75rem)", lineHeight: 1 }}>
            {admin ? "Aufgaben" : "Meine Aufgaben"}
          </h1>
        </div>
        {admin && <TaskCreateForm assignees={assignees} />}
      </header>

      {admin && (
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key ? `/admin/tasks?status=${f.key}` : "/admin/tasks"}
              className={cn(
                "rounded-full border border-border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                status === f.key ? "bg-foreground text-background" : "text-muted hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-muted">Keine Aufgaben.</p>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/tasks/${t.id}`}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/40"
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    t.status === "done" ? "bg-green-500" : t.status === "in_progress" ? "bg-[var(--gold)]" : t.status === "cancelled" ? "bg-muted" : "bg-foreground",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm", t.status === "done" || t.status === "cancelled" ? "text-muted line-through" : "text-foreground")}>
                    {t.title}
                  </div>
                  <div className="font-mono text-[10px] text-muted">
                    {t.assigneeName ?? "—"}
                    {t.dueDate ? ` · fällig ${new Date(t.dueDate).toLocaleDateString("de-DE")}` : ""}
                  </div>
                </div>
                <span className={cn("font-mono text-[9px] uppercase tracking-[0.2em]", PRIO_CLS[t.priority])}>
                  {PRIO_LABEL[t.priority]}
                </span>
                <span className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  {STATUS_LABEL[t.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
