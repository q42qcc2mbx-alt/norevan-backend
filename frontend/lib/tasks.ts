import "server-only";
import { api } from "@/lib/api/client";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type Task = {
  id: number;
  title: string;
  description: string;
  assigneeId: number | null;
  assigneeName: string | null;
  createdBy: number | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskComment = {
  id: number;
  body: string;
  authorName: string;
  createdAt: string;
};

export type TaskDetail = Task & { comments: TaskComment[] };
export type Assignee = { id: number; username: string; role: string };

export async function getTasks(query = ""): Promise<Task[]> {
  try {
    return await api.get<Task[]>(`/tasks${query ? `?${query}` : ""}`, { cache: "no-store" });
  } catch (err) {
    console.warn("[tasks] getTasks failed:", (err as Error).message);
    return [];
  }
}

export async function getTask(id: number): Promise<TaskDetail | null> {
  try {
    return await api.get<TaskDetail>(`/tasks/${id}`, { cache: "no-store" });
  } catch {
    return null;
  }
}

export async function getAssignees(): Promise<Assignee[]> {
  try {
    return await api.get<Assignee[]>("/tasks/assignees", { cache: "no-store" });
  } catch {
    return [];
  }
}
