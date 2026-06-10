import { NextResponse } from "next/server";
import { getAdminUser, effectiveRole } from "@/lib/auth/admin";
import { listMemories, addMemory, deleteMemory } from "@/lib/jarvis/store";

async function ownerOnly() {
  const user = await getAdminUser();
  return user && effectiveRole(user) === "owner";
}

export async function GET() {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ memories: await listMemories() });
}

export async function POST(req: Request) {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { kind?: string; content?: string } | null;
  const content = String(body?.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "empty" }, { status: 400 });
  await addMemory(String(body?.kind ?? "notiz"), content);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await ownerOnly())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await deleteMemory(id);
  return NextResponse.json({ ok: true });
}
