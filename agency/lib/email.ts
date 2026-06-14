import type { AuditResult } from "./audit";

/**
 * Report-Auslieferung (Autoresponder #1).
 *
 * Versendet über die Resend-REST-API — bewusst per `fetch`, damit KEINE neue
 * Abhängigkeit nötig ist. Aktiv NUR, wenn `RESEND_API_KEY` und `LEAD_FROM_EMAIL`
 * gesetzt sind. Ist nichts konfiguriert, liefert die Funktion `{ sent: false }`
 * zurück — der Lead bleibt trotzdem gespeichert (s. /api/lead) und das Team
 * wird per Webhook benachrichtigt, kann den Report also manuell schicken.
 *
 * So geht nichts Unwahres live: Wir behaupten dem Nutzer nur dann „Report ist
 * unterwegs", wenn er tatsächlich rausging.
 */

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

/** Build the HTML body from the real audit findings + the booking CTA. */
function reportHtml(audit: AuditResult, bookingUrl: string): string {
  const issues = audit.findings.filter((f) => f.severity !== "good");
  const criticals = issues.filter((f) => f.severity === "critical");
  const count = issues.length;
  const criticalCount = criticals.length;

  const issueRows = issues
    .map((f) => {
      const color = f.severity === "critical" ? "#dc2626" : "#d97706";
      const label = f.severity === "critical" ? "Kritisch" : "Verbesserung";
      return `
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #1e293b;vertical-align:top;">
          <span style="display:inline-block;font-size:11px;font-weight:700;color:#fff;background:${color};border-radius:999px;padding:2px 10px;margin-bottom:6px;">${label} · ${esc(f.category)}</span>
          <div style="font-size:15px;font-weight:600;color:#e8edf7;">${esc(f.title)}</div>
          <div style="font-size:13px;line-height:1.55;color:#a8b5cc;margin-top:4px;">${esc(f.detail)}</div>
        </td>
      </tr>`;
    })
    .join("");

  const headline =
    criticalCount > 0
      ? `Wir haben ${criticalCount} kritische ${criticalCount === 1 ? "Schwachstelle" : "Schwachstellen"} auf Ihrer Website gefunden.`
      : count > 0
        ? `Wir haben ${count} ${count === 1 ? "Punkt" : "Punkte"} mit echtem Potenzial gefunden.`
        : "Ihre Website ist technisch stark aufgestellt.";

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070b16;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:28px 16px;">
    <div style="background:linear-gradient(135deg,#0a0f1d,#0e1b33);border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
      <div style="padding:32px 28px 8px;">
        <div style="font-size:20px;font-weight:800;color:#e8edf7;">NOREVAN <span style="color:#60a5fa;">Digital</span></div>
        <h1 style="font-size:23px;line-height:1.25;color:#ffffff;margin:22px 0 6px;">${esc(headline)}</h1>
        <p style="font-size:14px;color:#8593ad;margin:0 0 4px;word-break:break-all;">Analysierte Adresse: ${esc(audit.url)} · Score ${audit.score}/100</p>
      </div>

      <div style="padding:14px 28px 4px;">
        <p style="font-size:15px;line-height:1.65;color:#a8b5cc;">
          Hallo,<br><br>
          wie versprochen — hier ist Ihr Report. Einige der Punkte unten nennen wir „stille Umsatz-Lecks": Dinge, die kein Besucher Ihnen je sagt. Er klickt einfach weg und geht zur Konkurrenz.
        </p>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
        ${issueRows || '<tr><td style="padding:16px 28px;color:#a8b5cc;font-size:14px;">Keine kritischen technischen Fehler — für das letzte Quäntchen Conversion sprechen wir gern persönlich.</td></tr>'}
      </table>

      <div style="padding:8px 28px 28px;">
        <p style="font-size:15px;line-height:1.65;color:#a8b5cc;">
          Die gute Nachricht: Jeder dieser Punkte ist behebbar — oft schneller, als Sie denken. In einem kurzen, kostenlosen Gespräch (15&nbsp;Min.) gehen wir den wichtigsten Punkt konkret mit Ihnen durch — ohne Verkaufsgerede.
        </p>
        <a href="${esc(bookingUrl)}" style="display:inline-block;background:linear-gradient(95deg,#2563eb,#1d4ed8);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;margin-top:10px;">
          Kostenloses 15-Min-Gespräch sichern →
        </a>
        <p style="font-size:13px;line-height:1.6;color:#8593ad;margin-top:20px;">
          Kurzer Hinweis: Wir nehmen pro Monat nur eine begrenzte Zahl dieser Gespräche an, weil wir jedes persönlich vorbereiten.<br><br>
          Beste Grüße<br><strong style="color:#e8edf7;">Ahmad</strong> · Gründer, NOREVAN Digital
        </p>
      </div>
    </div>
    <p style="font-size:11px;color:#5b6b88;text-align:center;margin:18px 8px 0;line-height:1.6;">
      Sie erhalten diese E-Mail, weil Sie eine kostenlose Website-Analyse angefordert haben.<br>
      NOREVAN Digital · Impressum &amp; Datenschutz unter norevan-agency.vercel.app
    </p>
  </div>
</body></html>`;
}

export interface SendResult {
  sent: boolean;
}

/** Send the audit report to the lead. Best-effort; never throws. */
export async function sendAuditReport(to: string, audit: AuditResult): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false };

  const bookingUrl = process.env.BOOKING_URL || "https://norevan-agency.vercel.app/kontakt";
  const issues = audit.findings.filter((f) => f.severity !== "good");
  const criticalCount = issues.filter((f) => f.severity === "critical").length;
  const subject =
    criticalCount > 0
      ? `⚠ Ihr Report: ${criticalCount} kritische ${criticalCount === 1 ? "Schwachstelle" : "Schwachstellen"} gefunden`
      : "Ihr kostenloser Website-Report ist da";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: reportHtml(audit, bookingUrl),
      }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("Resend send errored:", err);
    return { sent: false };
  }
}
