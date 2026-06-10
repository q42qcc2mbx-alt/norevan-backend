import { NextResponse } from "next/server";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { listTasks, addTask, setTaskStatus } from "@/lib/jarvis/store";

async function ownerOnly() {
  const user = await getAdminUser();
  return user && effectiveRole(user) === "owner";
}

export async function GET() {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ tasks: await listTasks() });
}

export async function POST(req: Request) {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { title?: string } | null;
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "empty" }, { status: 400 });
  await addTask(title);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { id?: number; status?: string } | null;
  const id = Number(body?.id);
  const status = body?.status === "done" ? "done" : "open";
  if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await setTaskStatus(id, status);
  return NextResponse.json({ ok: true });
}
