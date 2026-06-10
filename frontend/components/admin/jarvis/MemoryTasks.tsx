"use client";

import { useCallback, useEffect, useState } from "react";

// JARVIS memory + task manager panels. The AI writes here via its tools; the
// owner can also add/complete/delete entries manually.

type Memory = { id: number; kind: string; content: string };
type Task = { id: number; title: string; status: "open" | "done" };

export function MemoryTasks() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [newTask, setNewTask] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/jarvis/memory")
      .then((r) => r.json())
      .then((d: { memories?: Memory[] }) => d.memories && setMemories(d.memories))
      .catch(() => {});
    fetch("/api/admin/jarvis/tasks")
      .then((r) => r.json())
      .then((d: { tasks?: Task[] }) => d.tasks && setTasks(d.tasks))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000); // pick up entries Jarvis created in chat
    return () => clearInterval(id);
  }, [load]);

  async function addMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemory.trim()) return;
    await fetch("/api/admin/jarvis/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "notiz", content: newMemory.trim() }),
    });
    setNewMemory("");
    load();
  }

  async function removeMemory(id: number) {
    await fetch(`/api/admin/jarvis/memory?id=${id}`, { method: "DELETE" });
    load();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await fetch("/api/admin/jarvis/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim() }),
    });
    setNewTask("");
    load();
  }

  async function toggleTask(t: Task) {
    await fetch("/api/admin/jarvis/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, status: t.status === "done" ? "open" : "done" }),
    });
    load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Memory */}
      <div className="jarvis-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
          🧠 KI-Gedächtnis
          <span className="text-muted">({memories.length})</span>
        </div>
        <form onSubmit={addMemory} className="mb-4 flex gap-2">
          <input
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Erinnerung hinzufügen …"
            className="h-9 min-w-0 flex-1 rounded-full border border-border bg-background px-3 text-xs focus:border-cyan-400 focus:outline-none"
          />
          <button type="submit" className="rounded-full border border-cyan-500/40 px-3 text-xs text-cyan-300 hover:bg-cyan-500/10">
            +
          </button>
        </form>
        <ul className="max-h-64 space-y-2 overflow-y-auto" data-lenis-prevent>
          {memories.length === 0 && <li className="text-xs text-muted">Noch leer — sag Jarvis »merk dir …«</li>}
          {memories.map((m) => (
            <li key={m.id} className="group flex items-start gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs">
              <span className="mt-0.5 shrink-0 rounded-full border border-cyan-500/40 px-1.5 font-mono text-[8px] uppercase tracking-wide text-cyan-400">
                {m.kind}
              </span>
              <span className="min-w-0 flex-1">{m.content}</span>
              <button
                type="button"
                onClick={() => removeMemory(m.id)}
                aria-label="Löschen"
                className="text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tasks */}
      <div className="jarvis-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
          ⚙ Aufgabenmanager
          <span className="text-muted">({tasks.filter((t) => t.status === "open").length} offen)</span>
        </div>
        <form onSubmit={addTask} className="mb-4 flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Aufgabe hinzufügen …"
            className="h-9 min-w-0 flex-1 rounded-full border border-border bg-background px-3 text-xs focus:border-cyan-400 focus:outline-none"
          />
          <button type="submit" className="rounded-full border border-cyan-500/40 px-3 text-xs text-cyan-300 hover:bg-cyan-500/10">
            +
          </button>
        </form>
        <ul className="max-h-64 space-y-2 overflow-y-auto" data-lenis-prevent>
          {tasks.length === 0 && <li className="text-xs text-muted">Keine Aufgaben — Jarvis legt sie auch im Chat an.</li>}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs">
              <button
                type="button"
                onClick={() => toggleTask(t)}
                aria-label={t.status === "done" ? "Wieder öffnen" : "Erledigt"}
                className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[9px] ${
                  t.status === "done" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-border text-transparent hover:border-cyan-400"
                }`}
              >
                ✓
              </button>
              <span className={`min-w-0 flex-1 ${t.status === "done" ? "text-muted line-through" : ""}`}>{t.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
