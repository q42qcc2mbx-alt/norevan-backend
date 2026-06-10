import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// JARVIS persistence (chat history, long-term memory, tasks). The tables are
// RLS-locked with no policies, so this requires the service-role key — exactly
// like the newsletter route. All callers are owner-gated API routes.

export type JarvisMemory = { id: number; kind: string; content: string; created_at: string };
export type JarvisTask = { id: number; title: string; status: "open" | "done"; created_at: string };
export type JarvisMessage = { id: number; role: "user" | "assistant"; agent: string | null; content: string; created_at: string };

let _db: SupabaseClient | null = null;
export function jarvisDb(): SupabaseClient | null {
  if (_db) return _db;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _db = createClient(url, key);
  return _db;
}

export async function listMemories(): Promise<JarvisMemory[]> {
  const db = jarvisDb();
  if (!db) return [];
  const { data } = await db.from("jarvis_memory").select("*").order("created_at", { ascending: false }).limit(100);
  return (data as JarvisMemory[]) ?? [];
}

export async function addMemory(kind: string, content: string): Promise<void> {
  const db = jarvisDb();
  if (!db) return;
  await db.from("jarvis_memory").insert({ kind, content });
}

export async function deleteMemory(id: number): Promise<void> {
  const db = jarvisDb();
  if (!db) return;
  await db.from("jarvis_memory").delete().eq("id", id);
}

export async function listTasks(): Promise<JarvisTask[]> {
  const db = jarvisDb();
  if (!db) return [];
  const { data } = await db
    .from("jarvis_tasks")
    .select("*")
    .order("status", { ascending: false }) // open before done
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as JarvisTask[]) ?? [];
}

export async function addTask(title: string): Promise<void> {
  const db = jarvisDb();
  if (!db) return;
  await db.from("jarvis_tasks").insert({ title });
}

export async function setTaskStatus(id: number, status: "open" | "done"): Promise<void> {
  const db = jarvisDb();
  if (!db) return;
  await db
    .from("jarvis_tasks")
    .update({ status, done_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", id);
}

export async function listChatMessages(limit = 40): Promise<JarvisMessage[]> {
  const db = jarvisDb();
  if (!db) return [];
  const { data } = await db
    .from("jarvis_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as JarvisMessage[]) ?? []).reverse(); // chronological
}

export async function addChatMessage(role: "user" | "assistant", content: string, agent?: string): Promise<void> {
  const db = jarvisDb();
  if (!db) return;
  await db.from("jarvis_messages").insert({ role, content, agent: agent ?? null });
}
