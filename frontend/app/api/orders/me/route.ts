import { API_BASE_URL } from "@/lib/api/client";
import { getSupabaseAccessToken } from "@/lib/supabase/server";

// Returns the signed-in user's orders. Reads the Supabase session from the
// request cookies and forwards the access token to the Express backend, so the
// backend URL and token never reach the client. Guests get an empty list.
export async function GET() {
  const token = await getSupabaseAccessToken();
  if (!token) return Response.json({ orders: [] });

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/orders/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const backend = (await res.json()) as {
      status?: string;
      data?: unknown[];
    };
    if (!res.ok || backend.status !== "success") {
      return Response.json({ orders: [] });
    }
    return Response.json({ orders: backend.data ?? [] });
  } catch {
    return Response.json({ orders: [] });
  }
}
