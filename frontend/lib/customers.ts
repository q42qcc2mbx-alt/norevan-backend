// Server-only customer (CRM) data layer. Derived from orders — there is no
// separate customers table; a customer is the set of orders sharing an email.
import "server-only";
import { getAllOrders, type OrderWithItems } from "@/lib/orders";

const REALIZED = new Set(["paid", "shipped", "delivered"]);

export type Customer = {
  email: string;
  firstName: string;
  lastName: string;
  orderCount: number;
  /** Realized lifetime value in cents (paid/shipped/delivered only). */
  totalSpentCents: number;
  lastOrderAt: string;
  /** Heuristic segment for quick triage. */
  segment: "neu" | "wiederkäufer" | "vip";
};

function segmentOf(orderCount: number, totalSpentCents: number): Customer["segment"] {
  if (totalSpentCents >= 50_000) return "vip"; // ≥ 500 €
  if (orderCount >= 2) return "wiederkäufer";
  return "neu";
}

/** Roll the order log up into one row per customer email, richest first. */
export function customersFromOrders(orders: OrderWithItems[]): Customer[] {
  const map = new Map<
    string,
    {
      email: string;
      firstName: string;
      lastName: string;
      orderCount: number;
      totalSpentCents: number;
      lastOrderAt: string;
    }
  >();

  for (const o of orders) {
    const email = (o.email ?? "").toLowerCase();
    if (!email) continue;
    const cur = map.get(email) ?? {
      email,
      firstName: o.firstName,
      lastName: o.lastName,
      orderCount: 0,
      totalSpentCents: 0,
      lastOrderAt: o.createdAt,
    };
    cur.orderCount += 1;
    if (REALIZED.has(o.status)) cur.totalSpentCents += o.subtotalCents;
    if (new Date(o.createdAt) > new Date(cur.lastOrderAt)) {
      cur.lastOrderAt = o.createdAt;
      // Keep the most recent name on file.
      cur.firstName = o.firstName;
      cur.lastName = o.lastName;
    }
    map.set(email, cur);
  }

  return Array.from(map.values())
    .map((c) => ({ ...c, segment: segmentOf(c.orderCount, c.totalSpentCents) }))
    .sort((a, b) => b.totalSpentCents - a.totalSpentCents);
}

export async function getCustomers(): Promise<Customer[]> {
  const orders = await getAllOrders(2000);
  return customersFromOrders(orders);
}

/** A single customer plus their full order history (newest first). */
export async function getCustomer(
  email: string,
): Promise<{ customer: Customer; orders: OrderWithItems[] } | null> {
  const all = await getAllOrders(2000);
  const target = email.toLowerCase();
  const mine = all
    .filter((o) => (o.email ?? "").toLowerCase() === target)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  if (mine.length === 0) return null;
  const customer = customersFromOrders(mine)[0];
  return { customer, orders: mine };
}
