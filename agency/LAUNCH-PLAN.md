# 🚀 NOREVAN Digital — Launch-Plan bis zur Veröffentlichung

Stand: Juni 2026 · Live-Vorschau: https://norevan-agency.vercel.app

Dieser Plan enthält **alles**, was bis zur offiziellen Veröffentlichung zu tun
ist — sortiert nach Priorität. ✅ = bereits erledigt, ⬜ = offen,
👤 = nur Sie können es liefern/entscheiden.

---

## Phase 1 — Pflicht vor dem Launch (ohne das nicht veröffentlichen)

### 1.1 Recht (DSGVO / TMG — in Deutschland verpflichtend)
- ⬜👤 **Impressum-Seite** (`/impressum`): Firmenname, Rechtsform, Anschrift,
  vertretungsberechtigte Person, E-Mail, ggf. USt-IdNr. → Daten an mich, ich
  baue die Seite in 5 Minuten ein.
- ⬜👤 **Datenschutzerklärung** (`/datenschutz`): Hosting (Vercel/USA),
  Supabase (EU-Region eu-west-1 ✅), Formulardaten, KI-Verarbeitung
  (Anthropic), Speicherdauer, Betroffenenrechte. Generator (z. B.
  eRecht24/Datenschutz-Generator.de) + Daten an mich → ich binde sie ein.
- ✅ Keine Tracking-Cookies → aktuell **kein Cookie-Banner nötig** (nur
  funktionales localStorage für Theme/Sprache/Gerät).
- ⬜ Footer-Links auf Impressum & Datenschutz (mache ich, sobald Seiten da sind).

### 1.2 Eigene Domain
- ⬜👤 Domain kaufen (z. B. `norevan.digital` / `norevan-digital.de`) —
  bei Vercel direkt oder bei Namecheap/INWX.
- ⬜ Domain im Vercel-Projekt `norevan-agency` verbinden (Settings → Domains).
- ⬜ Env `NEXT_PUBLIC_SITE_URL=https://ihre-domain.de` setzen (SEO/Sitemap)
  und neu deployen.
- ⬜👤 **E-Mail-Postfach** für kontakt@ihre-domain.de einrichten (z. B.
  Strato/IONOS/Google Workspace) — aktuell verweist die Seite auf
  kontakt@norevan.digital, das noch nicht existiert.

### 1.3 Anfragen dürfen nicht verloren gehen
- ✅ Jede Analyse/Anfrage/Feedback landet in Supabase (Team-Dashboard).
- ⬜ **E-Mail-Benachrichtigung bei neuer Anfrage**: `LEAD_WEBHOOK_URL` in
  Vercel setzen (einfachster Weg: kostenloser Zapier/Make-Webhook → E-Mail an
  Team) — oder ich baue direkten SMTP-Versand ein, wenn Sie Zugangsdaten haben.
- ⬜👤 **Probelauf:** Analyse + Kontaktformular auf der Live-Seite absenden und
  prüfen, dass beides unter `/admin` erscheint.

### 1.4 Team & Zugänge
- ✅ 4 gleichberechtigte Admins, Verwaltung im Tab „Team".
- ⬜👤 Die 3 Platzhalter-Adressen (`mohammad@/mazen@/abdulghani@norevan.digital`)
  durch **echte E-Mails** ersetzen (Tab „Team") + jeder registriert ein Konto.
- ⬜👤 Entscheiden: E-Mail-Bestätigung bei Registrierung an/aus
  (Supabase → Authentication → Providers → Email → "Confirm email").
- ⬜ Supabase Auth → URL Configuration: Site-URL + Redirect auf die echte
  Domain stellen (sonst zeigen Bestätigungslinks auf localhost).

### 1.5 Echte KI aktivieren
- ⬜👤 `ANTHROPIC_API_KEY` in Vercel setzen (console.anthropic.com → API Keys,
  Guthaben aufladen). Ohne Key laufen Analyse/Chat im Regel-Modus — gut, aber
  mit Claude sind die Texte individuell auf jedes Kundenziel zugeschnitten.
- Kostenrahmen: ca. 2–6 Cent pro Analyse, Chat deutlich weniger.

### 1.6 PR mergen & Produktionszweig
- ✅ Deploy-Workflow feuert jetzt auch auf `main` (gerade gefixt).
- ⬜👤 **PR #23 mergen** → ab dann ist `main` die Produktionsquelle.
- ⬜ Empfohlen: Vercel-Git-Integration des alten Shop-Projekts „frontend"
  deaktivieren (Settings → Git) — entfernt das dauerhafte rote ❌ an PRs.

---

## Phase 2 — Design-Feinschliff (macht aus „sehr gut" → „premium")

- ⬜👤 **Echtes Logo**: aktuell ein Blitz-Icon + Schriftzug. Ein individuelles
  Logo (SVG) hebt die Marke ab — liefern Sie eines, oder ich gestalte 2–3
  Vorschläge zur Auswahl.
- ⬜ **OG-Share-Bild** (1200×630): erscheint beim Teilen auf WhatsApp/LinkedIn/
  Google. Generiere ich passend zum Branding.
- ⬜👤 **Team-Fotos** auf /ueber-uns statt Initialen-Kreise — echte Gesichter
  sind der stärkste Vertrauensfaktor (professionelle Porträts, einheitlicher
  Stil/Hintergrund).
- ⬜👤 **Echte Portfolio-Screenshots** statt CSS-Mockups, sobald die ersten
  3 echten Projekte da sind — inkl. echter Vorher/Nachher-Zahlen.
- ⬜👤 **Echte Kundenstimmen**: die 3 Testimonials sind Beispieltexte — vor dem
  Launch durch echte ersetzen (oder Sektion vorerst ausblenden; sage ich Ihnen
  ehrlich: erfundene Bewertungen sind rechtlich riskant).
- ⬜ Eigene Display-Schrift fürs Headline-Branding (z. B. „Söhne", „General
  Sans") statt nur Inter — kleiner Schritt, großer Charakter-Gewinn.
- ⬜ Micro-Animationen: sanfte Hover-Tilts auf Portfolio-Karten, animierter
  Zahlen-Tick im Hero-Visual — dezent, performant.

## Phase 3 — Inhalte & Conversion

- ⬜👤 Preis-Orientierung („Projekte ab X €") auf /leistungen — filtert
  unpassende Anfragen und erhöht die Qualität der Leads. Ihre Entscheidung.
- ⬜ Mini-Case-Study-Seite pro Portfolio-Projekt (1 Seite: Ausgangslage →
  Maßnahmen → Ergebnis) — stärkstes Verkaufsargument.
- ⬜ Blog/Ratgeber (1 Artikel/Monat reicht): „Warum lädt meine Website langsam?"
  etc. — bringt langfristig Google-Traffic auf die KI-Analyse.
- ⬜ E-Mail-Auto-Antwort nach Analyse („Ihr Report als PDF") — braucht SMTP.

## Phase 4 — Sichtbarkeit nach dem Launch

- ⬜👤 **Google Search Console**: Domain verifizieren, `sitemap.xml` einreichen.
- ⬜👤 **Google Business Profile** anlegen (lokale Suche!).
- ⬜ Analytics, datenschutzfreundlich ohne Cookie-Banner: **Plausible** oder
  **Vercel Analytics** (1 Klick im Vercel-Dashboard) — ich binde es ein.
- ⬜👤 LinkedIn/Instagram-Profil mit Link auf die Seite.
- ⬜ `llms.txt` + saubere strukturierte Daten sind vorhanden ✅ (JSON-LD).

## Phase 5 — Betrieb & Sicherheit (laufend)

- ⬜ **Uptime-Monitoring** (UptimeRobot kostenlos): Alarm wenn Seite down.
- ⬜ **Error-Tracking** (Sentry, kostenloser Plan) — ich kann es einbauen.
- ✅ Backups: Supabase macht tägliche Backups automatisch.
- ✅ Security: RLS auf allen Tabellen, Rate-Limits, Honeypots, Security-Header,
  SSRF-Schutz, Auth-gegateter KI-Endpoint.
- ⬜ Vierteljährlich: `npm audit` + Dependency-Updates (kann ich automatisieren
  mit Dependabot).

---

## Was ich sofort von Ihnen brauche (Reihenfolge)

1. **Impressums- & Datenschutz-Daten** (Phase 1.1) — größter Blocker
2. **Wunsch-Domain** (Phase 1.2)
3. **Echte Team-E-Mails** der 3 Kollegen (Phase 1.4)
4. **ANTHROPIC_API_KEY** in Vercel (Phase 1.5)
5. **Merge von PR #23** (Phase 1.6)

Sobald 1–5 erledigt sind, ist die Seite offiziell veröffentlichbar —
alles in Phase 2–5 verbessert sie danach Schritt für Schritt weiter.
