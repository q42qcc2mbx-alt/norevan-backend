"use client";

import { useState } from "react";
import { Check, Copy, FileText, Receipt } from "lucide-react";
import { legal } from "@/lib/site.config";

// Copyable offer + invoice templates for the team — with the payment-protection
// wording (deposit, retention of title) so nobody ships before being paid.

const name = legal.companyName.trim() || "[Firmenname]";
const addr =
  [legal.street, [legal.postalCode, legal.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") ||
  "[Adresse]";
const contact = [legal.email, legal.phone].filter(Boolean).join(" · ") || "[E-Mail] · [Telefon]";

const ANGEBOT = `ANGEBOT

${name}
${addr} · ${contact}

Angebot-Nr.: [${new Date().getFullYear()}-001]
Datum: [TT.MM.JJJJ]   ·   Gültig bis: [TT.MM.JJJJ]

Für:
[Kundenname / Firma]
[Adresse]

Leistung:
- [z. B. Website-Optimierung: Performance, SEO & Sicherheit]
- [optionale weitere Position]

Festpreis: [Betrag] € zzgl. 19 % USt.

Zahlungsbedingungen:
- 50 % Anzahlung bei Auftragserteilung: [Betrag] €
- 50 % Restzahlung vor Live-Schaltung / Übergabe: [Betrag] €
- Die Nutzungsrechte gehen erst nach vollständiger Zahlung über (Eigentumsvorbehalt).

Umsetzung: ca. [X] Wochen ab Anzahlung und Bereitstellung aller Inhalte/Zugänge.

Mit der Annahme dieses Angebots (per E-Mail genügt) gelten unsere AGB.

Wir freuen uns auf die Zusammenarbeit!
${name}`;

const RECHNUNG = `RECHNUNG

${name}
${addr} · ${contact}
USt-IdNr.: ${legal.vatId || "[DEXXXXXXXXX]"}

Rechnungs-Nr.: [${new Date().getFullYear()}-001]
Rechnungsdatum: [TT.MM.JJJJ]   ·   Leistungsdatum: [TT.MM.JJJJ]

Rechnungsempfänger:
[Kundenname / Firma]
[Adresse]

Pos.  Beschreibung                              Betrag (netto)
1     [Website-Optimierung lt. Angebot …]       [Betrag] €
      ggf. abzgl. geleisteter Anzahlung         – [Betrag] €

                                  Nettosumme:   [Betrag] €
                                  zzgl. 19 % USt: [Betrag] €
                                  ─────────────────────────
                                  Gesamtbetrag:  [Betrag] €

Zahlbar innerhalb von 14 Tagen ohne Abzug auf:
[Bank] · IBAN [DEXX XXXX XXXX XXXX XXXX XX] · BIC [XXXXXXXX]
Verwendungszweck: Rechnungs-Nr. [${new Date().getFullYear()}-001]

Vielen Dank für Ihren Auftrag!
${name}`;

function TemplateCard({ icon: Icon, title, hint, text }: { icon: typeof FileText; title: string; hint: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-edge p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink">{title}</h3>
            <p className="text-xs text-ink-muted">{hint}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          className="btn-secondary inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-ink-soft">
        {text}
      </pre>
    </div>
  );
}

export default function Templates() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-soft">
        Fertige Vorlagen mit Zahlungsschutz (Anzahlung + Eigentumsvorbehalt). Platzhalter in
        eckigen Klammern ersetzen. Firmendaten werden automatisch aus den Stammdaten gefüllt.
      </p>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <TemplateCard icon={FileText} title="Angebot" hint="An Interessenten senden" text={ANGEBOT} />
        <TemplateCard icon={Receipt} title="Rechnung" hint="Nach Auftrag / Fertigstellung" text={RECHNUNG} />
      </div>
    </div>
  );
}
