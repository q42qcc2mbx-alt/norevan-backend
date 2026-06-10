import "server-only";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/products";
import { getAnalytics } from "@/lib/analytics";

// Live business snapshot for JARVIS: powers the Command Center, the proactive
// findings and the context the AI reasons over. Pure reads, no caching — the
// owner wants the current state.

const REALIZED = new Set(["paid", "shipped", "delivered"]);

export type Finding = { level: "warn" | "info" | "ok"; text: string };

export type Snapshot = {
  generatedAt: string;
  revenue: { todayCents: number; week7Cents: number; days30Cents: number; totalCents: number };
  orders: { today: number; pendingOpen: number; pendingStale: number; total: number };
  visitors: { last30d: number; online: number; conversionPct: number };
  topSellers: { name: string; qty: number; revenueCents: number }[];
  lowStock: { name: string; stock: number }[];
  missingCost: string[];
  productCount: number;
  findings: Finding[];
};

export async function buildSnapshot(): Promise<Snapshot> {
  const [orders, products, analytics] = await Promise.all([
    getAllOrders(1000),
    getAllProducts(),
    getAnalytics(30),
  ]);

  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  let todayCents = 0;
  let week7Cents = 0;
  let days30Cents = 0;
  let totalCents = 0;
  let ordersToday = 0;
  let pendingOpen = 0;
  let pendingStale = 0;
  const sellers = new Map<string, { qty: number; revenueCents: number }>();

  for (const o of orders) {
    const t = new Date(o.createdAt).getTime();
    if (t >= dayStart.getTime()) ordersToday += 1;
    if (o.status === "pending") {
      pendingOpen += 1;
      if (now - t > 48 * 3600_000) pendingStale += 1;
    }
    if (!REALIZED.has(o.status)) continue;
    totalCents += o.subtotalCents;
    if (t >= dayStart.getTime()) todayCents += o.subtotalCents;
    if (now - t <= 7 * 86400_000) week7Cents += o.subtotalCents;
    if (now - t <= 30 * 86400_000) days30Cents += o.subtotalCents;
    for (const it of o.items) {
      const cur = sellers.get(it.name) ?? { qty: 0, revenueCents: 0 };
      cur.qty += it.qty;
      cur.revenueCents += it.priceCents * it.qty;
      sellers.set(it.name, cur);
    }
  }

  const topSellers = Array.from(sellers.entries())
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const lowStock = products
    .filter((p) => typeof p.stock === "number" && p.stock <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 10)
    .map((p) => ({ name: p.name, stock: p.stock ?? 0 }));

  const missingCost = products.filter((p) => !p.costCents).map((p) => p.name);

  const visitors = analytics?.totals.visitors ?? 0;
  const online = analytics?.totals.online ?? 0;
  const realizedOrders30 = orders.filter(
    (o) => REALIZED.has(o.status) && now - new Date(o.createdAt).getTime() <= 30 * 86400_000,
  ).length;
  const conversionPct = visitors > 0 ? (realizedOrders30 / visitors) * 100 : 0;

  // ── Proactive findings (rule-based, runs on every load) ──
  const findings: Finding[] = [];
  const soldOut = lowStock.filter((p) => p.stock === 0);
  if (soldOut.length > 0)
    findings.push({ level: "warn", text: `${soldOut.length} Produkt(e) ausverkauft: ${soldOut.map((p) => p.name).join(", ")} — nachbestellen oder ausblenden.` });
  const low = lowStock.filter((p) => p.stock > 0);
  if (low.length > 0)
    findings.push({ level: "warn", text: `Niedriger Bestand bei ${low.length} Produkt(en): ${low.map((p) => `${p.name} (${p.stock})`).join(", ")}.` });
  if (pendingStale > 0)
    findings.push({ level: "warn", text: `${pendingStale} unbezahlte Bestellung(en) älter als 48 h — Erinnerung läuft, ggf. Kunden direkt kontaktieren.` });
  if (missingCost.length > 0)
    findings.push({ level: "info", text: `${missingCost.length} Produkt(e) ohne Einkaufspreis — Gewinn/Marge unvollständig. Im Produktformular nachtragen.` });
  if (week7Cents === 0)
    findings.push({ level: "warn", text: "Kein realisierter Umsatz in den letzten 7 Tagen — Marketing-Impuls empfohlen (z. B. WILLKOMMEN10 bewerben)." });
  if (visitors >= 100 && conversionPct < 1)
    findings.push({ level: "info", text: `Conversion nur ${conversionPct.toFixed(1)} % bei ${visitors} Besuchern — Produktseiten/Preise prüfen.` });
  if (findings.length === 0)
    findings.push({ level: "ok", text: "Keine Auffälligkeiten — alle Systeme im grünen Bereich." });

  return {
    generatedAt: new Date().toISOString(),
    revenue: { todayCents, week7Cents, days30Cents, totalCents },
    orders: { today: ordersToday, pendingOpen, pendingStale, total: orders.length },
    visitors: { last30d: visitors, online, conversionPct },
    topSellers,
    lowStock,
    missingCost,
    productCount: products.length,
    findings,
  };
}
