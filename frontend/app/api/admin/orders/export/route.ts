import { getAllOrders } from "@/lib/orders";
import { isAdminAuthed } from "@/lib/auth/admin";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await isAdminAuthed())) {
    return new Response("Forbidden", { status: 403 });
  }

  const orders = await getAllOrders(1000);

  const header = [
    "Bestell-ID",
    "Datum",
    "Status",
    "Vorname",
    "Nachname",
    "E-Mail",
    "Adresse",
    "PLZ",
    "Stadt",
    "Land",
    "Artikel",
    "Summe (EUR)",
  ];

  const rows = orders.map((o) =>
    [
      o.id,
      new Date(o.createdAt).toISOString(),
      o.status,
      o.firstName,
      o.lastName,
      o.email,
      o.address,
      o.zip,
      o.city,
      o.country,
      o.items.reduce((s, i) => s + i.qty, 0),
      (o.subtotalCents / 100).toFixed(2),
    ]
      .map(esc)
      .join(","),
  );

  const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="norevan-bestellungen.csv"`,
    },
  });
}
