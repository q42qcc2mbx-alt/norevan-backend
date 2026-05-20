// Server-only order data layer. Calls the Express backend.
import "server-only";
import { api, ApiError } from "@/lib/api/client";

export type Order = {
  id: string;
  userId: number | null;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  subtotalCents: number;
  status: string;
  /** ISO date string from the backend */
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: string;
  slug: string;
  name: string;
  size: string | null;
  qty: number;
  priceCents: number;
  image: string;
};

export type OrderWithItems = Order & { items: OrderItem[] };

/** Public — anyone with the orderId (treated as a magic token) can read. */
export async function getOrderById(
  id: string,
): Promise<OrderWithItems | null> {
  try {
    return await api.get<OrderWithItems>(
      `/orders/${encodeURIComponent(id)}`,
      { noAuth: true, cache: "no-store" },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    console.warn("[orders] getOrderById failed:", (err as Error).message);
    return null;
  }
}

/** Admin-only — requires Authorization header with admin JWT. */
export async function getAllOrders(limit = 100): Promise<OrderWithItems[]> {
  try {
    return await api.get<OrderWithItems[]>(
      `/admin/orders?limit=${limit}`,
      { cache: "no-store" },
    );
  } catch (err) {
    console.warn("[orders] getAllOrders failed:", (err as Error).message);
    return [];
  }
}

/** Authed user — own orders. */
export async function getMyOrders(): Promise<OrderWithItems[]> {
  try {
    return await api.get<OrderWithItems[]>("/orders/me", {
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[orders] getMyOrders failed:", (err as Error).message);
    return [];
  }
}

/** Admin-only — update status. */
export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<void> {
  await api.patch(`/admin/orders/${encodeURIComponent(id)}`, { status });
}
