import { getAnalytics } from "@/lib/analytics";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";

const RANGES = [7, 30, 90];
const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const d = Number(url.searchParams.get("days"));
  const days = RANGES.includes(d) ? d : 30;

  const data = await getAnalytics(days);
  if (!data) return new Response("No data", { status: 502 });

  const lines: string[] = [];
  lines.push(`Norevan Analytics — letzte ${days} Tage`);
  lines.push(
    `Besucher,${data.totals.visitors},Seitenaufrufe,${data.totals.views}`,
  );
  lines.push("");
  lines.push("Datum,Aufrufe,Besucher");
  for (const s of data.series) lines.push(`${s.day},${s.views},${s.visitors}`);
  lines.push("");
  lines.push("Top-Seiten,Aufrufe");
  for (const p of data.topPages) lines.push(`${esc(p.path)},${p.views}`);
  lines.push("");
  lines.push("Top-Länder,Aufrufe");
  for (const c of data.topCountries) lines.push(`${esc(c.country)},${c.views}`);
  lines.push("");
  lines.push("Geräte,Aufrufe");
  for (const dev of data.devices) lines.push(`${esc(dev.device)},${dev.views}`);

  // Prepend a BOM so Excel detects UTF-8.
  const csv = "﻿" + lines.join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="norevan-analytics-${days}d.csv"`,
    },
  });
}
