/**
 * ZENTRALE SEITEN-KONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────
 * Das ist die EINZIGE Datei, die Sie selbst anfassen müssen, um die Seite
 * rechtlich startklar zu machen. Tragen Sie unten Ihre echten Firmendaten ein
 * und setzen Sie anschließend `LEGAL_DATA_COMPLETE` auf `true`.
 *
 * Diese Werte speisen automatisch:
 *   • /impressum          (Impressum nach § 5 DDG/TMG)
 *   • /datenschutz        (Datenschutzerklärung nach DSGVO)
 *   • den Footer          (Kontakt-E-Mail + Rechtliches-Links)
 *
 * WICHTIG: Solange `LEGAL_DATA_COMPLETE = false` ist, zeigen Impressum und
 * Datenschutz oben einen deutlich sichtbaren „Entwurf"-Hinweis und die Felder,
 * die noch nicht ausgefüllt sind, erscheinen als „[… eintragen]". So kann
 * versehentlich nichts Falsches live gehen.
 */

/** Auf `true` setzen, sobald ALLE Pflichtfelder unten echt ausgefüllt sind. */
export const LEGAL_DATA_COMPLETE = false;

/** Zentrale Kontakt-E-Mail (Footer, Impressum, Datenschutz, mailto-Links). */
export const CONTACT_EMAIL = "kontakt@norevan.digital";

export const legal = {
  // ── Pflichtangaben Impressum (§ 5 DDG, früher TMG) ──────────────────────
  /** Vollständiger Firmenname inkl. Rechtsform, z. B. „NOREVAN Digital GmbH". */
  companyName: "",
  /** Rechtsform, z. B. „GmbH", „GbR", „Einzelunternehmen". */
  legalForm: "",
  /** Vertretungsberechtigte Person(en), z. B. „Geschäftsführer: Max Mustermann". */
  representative: "",
  /** Straße + Hausnummer. */
  street: "",
  /** PLZ. */
  postalCode: "",
  /** Ort. */
  city: "",
  /** Land. */
  country: "Deutschland",
  /** Telefonnummer (optional, aber empfohlen für schnelle Erreichbarkeit). */
  phone: "",
  /** Kontakt-E-Mail (Pflicht). Default = CONTACT_EMAIL. */
  email: CONTACT_EMAIL,

  // ── Optionale Angaben (nur ausfüllen, falls zutreffend) ─────────────────
  /** Umsatzsteuer-ID nach § 27a UStG, z. B. „DE123456789". */
  vatId: "",
  /** Registergericht, z. B. „Amtsgericht München". */
  registerCourt: "",
  /** Registernummer, z. B. „HRB 123456". */
  registerNumber: "",
  /** Wirtschafts-ID (selten erforderlich). */
  economicId: "",
  /**
   * Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (bei redaktionellen
   * Inhalten / Blog). Format: „Vorname Nachname, Anschrift wie oben".
   */
  contentResponsible: "",
} as const;

// ── Datenschutz-relevante Stack-Angaben (bereits korrekt vorbelegt) ───────
// Diese müssen Sie i. d. R. NICHT ändern — sie beschreiben die real genutzte
// Infrastruktur und werden in der Datenschutzerklärung referenziert.
export const privacy = {
  /** Hosting der Website. */
  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, USA",
    transfer: "USA (Drittland, Standardvertragsklauseln)",
  },
  /** Datenbank / Auth / Speicher. */
  database: {
    name: "Supabase (Supabase Inc.)",
    region: "EU (eu-west-1, Irland)",
  },
  /** KI-Verarbeitung für Analyse & Chat. */
  ai: {
    name: "Anthropic PBC (Claude API)",
    note: "Verarbeitung nur bei aktiver Analyse/Chat-Nutzung; keine Trainingsnutzung der API-Daten.",
  },
  /** Speicherdauer für Leads/Anfragen. */
  retention: "Anfragedaten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind, spätestens nach gesetzlichen Aufbewahrungsfristen.",
} as const;

// ── Preise (Orientierung, die die KI nennen darf) ─────────────────────────
// WICHTIG: Das sind VORSCHLÄGE — bitte prüfen und an Ihre echten Preise
// anpassen. Sie ändern alles an EINER Stelle; die KI (Kunden-Chat + Admin-
// Assistent) nennt automatisch diese Werte, immer als „ab"/Orientierung,
// nie als verbindliches Angebot. `quote: false` → KI nennt keine Zahlen,
// sondern verweist nur aufs kostenlose Erstgespräch.
export const pricing = {
  quote: true,
  note: "Orientierungspreise. Der genaue Festpreis folgt nach der kostenlosen Analyse — abhängig vom Umfang.",
  packages: [
    { name: "Kostenlose KI-Website-Analyse", price: "0 €", desc: "30-Sekunden-Scan: Performance, Sicherheit, SEO, Mobile & Conversion-Killer." },
    { name: "Website-Optimierung", price: "ab 690 €", desc: "Bestehende Seite messbar schneller, sicherer und conversion-stärker." },
    { name: "Neue Landingpage", price: "ab 1.490 €", desc: "Eine fokussierte, blitzschnelle Seite, die verkauft." },
    { name: "Mehrseitige Unternehmens-Website", price: "ab 2.900 €", desc: "Individuelles Design, mehrere Seiten, CMS nach Wahl." },
    { name: "Sicherheit & Performance", price: "ab 490 €", desc: "Security-Audit, Härtung, Backups & Monitoring, DSGVO-Check." },
    { name: "Betreuung & Wartung", price: "ab 49 €/Monat", desc: "Updates, Monitoring, kleine Änderungen, fester Ansprechpartner." },
  ],
} as const;

/** Die drei kommerziellen Wege auf /loesungen. Preise sind Orientierung
 *  („ab"), zentral hier editierbar — Miete bitte an dein Modell anpassen. */
export const solutions = {
  optimieren: { price: "ab 690 €" },
  mieten: { price: "ab 99 €/Monat" },
  kaufen: { price: "ab 1.490 €" },
} as const;

/** Preis-Wissen als Text für die KI-System-Prompts. */
export function pricingSummary(): string {
  if (!pricing.quote) {
    return "PREISE: Nenne KEINE konkreten Zahlen. Sag, der Preis hängt vom Umfang ab und wird nach der kostenlosen Analyse als transparentes Festpreis-Angebot genannt.";
  }
  return (
    "PREIS-ORIENTIERUNG (du darfst diese nennen — IMMER als „ab\"/Orientierung, NIE als verbindliches Angebot):\n" +
    pricing.packages.map((p) => `- ${p.name}: ${p.price} — ${p.desc}`).join("\n") +
    `\nHinweis an den Kunden: ${pricing.note}`
  );
}

// ── Funktions-Schalter (Feature-Flags) ────────────────────────────────────
export const features = {
  /**
   * Kundenstimmen-Sektion auf /portfolio.
   * Steht auf `false`, weil die aktuellen 3 Texte BEISPIELE sind — erfundene
   * Bewertungen sind in Deutschland abmahnbar (§ 5 UWG). Auf `true` setzen,
   * sobald in `lib/translations.ts` echte, belegbare Kundenstimmen stehen.
   */
  showTestimonials: false,
  /**
   * Preis-Orientierung auf /leistungen („Projekte ab X €").
   * Auf `true` setzen und Beträge in der Preis-Sektion eintragen, sobald Sie
   * sich für eine Preiskommunikation entschieden haben.
   */
  showPricing: false,
} as const;
