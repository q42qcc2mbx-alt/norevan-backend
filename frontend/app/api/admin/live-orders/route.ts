import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth/admin";
import { getAllOrders } from "@/lib/orders";

// Polled by the back-office live order feed. Returns a slim, recent-first list.
// Reads the admin cookie, so it renders dynamically per request.
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await getAllOrders(30);
  const slim = orders.map((o) => ({
    id: o.id,
    name: `${o.firstName} ${o.lastName}`.trim() || o.email,
    city: o.city,
    country: o.country,
    status: o.status,
    cents: o.subtotalCents,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty })),
  }));

  return NextResponse.json(
    { orders: slim },
    { headers: { "cache-control": "no-store" } },
  );
}
