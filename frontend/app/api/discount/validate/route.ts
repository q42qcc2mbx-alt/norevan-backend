import { API_BASE_URL } from "@/lib/api/client";

// Public proxy to the backend discount preview (keeps the API base server-side).
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; subtotalCents?: number };
    const res = await fetch(`${API_BASE_URL}/api/v1/discount/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json()) as { data?: unknown };
    return Response.json(json?.data ?? { valid: false });
  } catch {
    return Response.json({ valid: false, message: "Fehler" });
  }
}
