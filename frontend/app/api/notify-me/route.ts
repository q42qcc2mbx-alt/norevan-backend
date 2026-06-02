import { API_BASE_URL } from "@/lib/api/client";

// Public proxy: subscribe an email to a product's back-in-stock alert.
export async function POST(req: Request) {
  try {
    const { slug, email } = (await req.json()) as { slug?: string; email?: string };
    if (!slug || !email) {
      return Response.json({ ok: false }, { status: 400 });
    }
    const res = await fetch(
      `${API_BASE_URL}/api/v1/products/${encodeURIComponent(slug)}/notify-me`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
      },
    );
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : res.status });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
