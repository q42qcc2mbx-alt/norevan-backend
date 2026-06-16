# NOREVAN Digital — Agentur-Website & Kundenplattform

Mehrseitige Agentur-Website mit KI-Analyse, Kundenkonten, Dashboards und
KI-Assistent.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** mit Dark/Light Mode (`next-themes`)
- **Motion** (Framer Motion) für Animationen
- **Supabase** (Postgres + Auth, RLS-gesichert) für Analysen, Anfragen,
  Projekte und Nachrichten
- **Anthropic Claude** (optional) für KI-Analyse und Chat-Assistent
- **lucide-react** Icons

## Seiten

| Route | Inhalt |
| --- | --- |
| `/` | Startseite (Hero, Statistiken, Leistungen, Vorteile, Kundenstimmen) |
| `/leistungen` | Leistungen, Ablauf, FAQ |
| `/analyse` | KI-Website-Analyse (URL + Ziel → Score, Probleme, Empfehlungen, Prioritäten) |
| `/portfolio` | Projektkarten mit Ergebnissen |
| `/ueber-uns` | Team (rollenbasiert: Entwicklung, Design, Sicherheit, Wachstum) + Werte |
| `/kontakt` | Kontaktformular |
| `/login`, `/registrieren` | Kundenkonto (Supabase Auth) |
| `/dashboard` | Kunden-Dashboard: Analysen, Projekte mit Status-Timeline, Nachrichten |
| `/admin` | Team-Dashboard: alle Analysen & Anfragen, Projekte anlegen/aktualisieren, Nachrichten senden |

Der **KI-Assistent** (unten rechts) ist auf allen Seiten verfügbar.

## Starter-Kit-Features (integriert)

- **KI-Texthilfe** im Kunden-Dashboard: Beschreibung + Fokus (Texte, SEO,
  Design, Conversion, Über-uns) → kopierfertige Verbesserungstexte
  (`/api/ai`, nur für eingeloggte Nutzer; Claude oder Template-Fallback)
- **Geräteauswahl** beim Erstbesuch (Handy/Tablet/Computer, automatisch
  erkannt, in localStorage gespeichert, als `data-device` auf `<html>`)
- **Rollenmodell**: genau zwei Rollen — Kunde und Admin. **Kein Owner**;
  die vier Teammitglieder sind gleichberechtigte Admins und verwalten die
  Admin-Liste selbst im Team-Dashboard (Tab „Team").

## Datenbank (Supabase)

Tabellen `agency_analyses`, `agency_leads`, `agency_projects`,
`agency_messages`, `agency_admins` — alle mit Row Level Security:

- Besucher können Analysen/Anfragen **einreichen**, aber nichts lesen.
- Kunden sehen nur **eigene** Daten (per User-ID oder verifizierter E-Mail).
- Team-Mitglieder (E-Mail in `agency_admins`) sehen und verwalten alles.

Admin hinzufügen: `insert into agency_admins (email) values ('person@firma.de');`

## Konfiguration

| Variable | Zweck |
| --- | --- |
| `ANTHROPIC_API_KEY` | Aktiviert echte KI für Analyse & Chat (sonst regelbasierter Fallback) |
| `AGENCY_AI_MODEL` | Modell-Override (Default: `claude-opus-4-8`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase-Override (Defaults sind eingebaut) |
| `NEXT_PUBLIC_SITE_URL` | Kanonische URL für SEO/Sitemap |
| `LEAD_WEBHOOK_URL` | Webhook (Slack/n8n/Zapier) für neue Anfragen |

## Entwicklung

```bash
cd agency
npm install
npm run dev      # → http://localhost:3100
```
