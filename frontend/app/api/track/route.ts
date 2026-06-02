import { api } from "@/lib/api/client";

// Best-effort page-view tracking. The browser beacons here; this handler adds
// server-only signals (geo from the edge, device from UA) the client can't be
// trusted with, then forwards to the backend which writes to the DB.
export async function POST(request: Request) {
  try {
    const { path, referrer, sessionId } = (await request.json()) as {
      path?: string;
      referrer?: string;
      sessionId?: string;
    };

    if (path) {
      const h = request.headers;
      const country =
        h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? undefined;
      const ua = h.get("user-agent") ?? "";
      const device = /tablet|ipad|playbook|silk/i.test(ua)
        ? "tablet"
        : /mobi|iphone|android.*mobile|phone|ipod/i.test(ua)
          ? "mobile"
          : "desktop";

      await api.post(
        "/track",
        { path, referrer, sessionId, country, device },
        { noAuth: true },
      );
    }
  } catch {
    // never surface tracking errors to the client
  }
  return new Response(null, { status: 204 });
}
