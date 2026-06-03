import { getSubscribers } from "@/lib/newsletter";
import { getAdminUser, canSeeRevenue, effectiveRole } from "@/lib/auth/admin";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const user = await getAdminUser();
  if (!user || !canSeeRevenue(effectiveRole(user))) {
    return new Response("Forbidden", { status: 403 });
  }

  const subscribers = await getSubscribers(5000);

  const header = ["E-Mail", "Angemeldet", "Quelle", "Abgemeldet"];
  const rows = subscribers.map((s) =>
    [
      s.email,
      new Date(s.subscribedAt).toISOString(),
      s.source ?? "",
      s.unsubscribed ? "ja" : "nein",
    ]
      .map(esc)
      .join(","),
  );

  // Prepend a BOM so Excel detects UTF-8.
  const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="norevan-newsletter.csv"`,
    },
  });
}
