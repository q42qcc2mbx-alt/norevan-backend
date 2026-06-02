import { API_BASE_URL } from "@/lib/api/client";
import { getSupabaseAccessToken } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/cart-store";

type CheckoutBody = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  items: CartItem[];
  discountCode?: string;
};

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Forward to the Express backend. If the user is signed in (Supabase), the
  // Bearer token attaches the order to their account; otherwise it's a guest order.
  const token = await getSupabaseAccessToken();

  const res = await fetch(`${API_BASE_URL}/api/v1/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Norevan-Locale": req.headers.get("x-norevan-locale") ?? "de",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  type BackendResponse = {
    status: "success" | "error";
    message?: string;
    errors?: string[];
    data?: {
      orderId: string;
      subtotalCents: number;
      paymentStatus: string;
      checkoutUrl?: string;
    };
  };
  const backend = (await res.json()) as BackendResponse;

  if (!res.ok || backend.status !== "success") {
    return Response.json(
      {
        error: backend.message ?? "checkout_failed",
        details: backend.errors,
      },
      { status: res.status || 500 },
    );
  }

  return Response.json({
    status: backend.data?.paymentStatus ?? "pending",
    orderId: backend.data?.orderId,
    // Present when Stripe is enabled — the client redirects here to pay.
    checkoutUrl: backend.data?.checkoutUrl ?? null,
  });
}
