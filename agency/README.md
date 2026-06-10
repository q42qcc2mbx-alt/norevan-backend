# NOREVAN Digital — Agentur-Website

Moderne One-Page-Website für Website-Optimierung, Performance, Sicherheit und
SEO — inkl. KI-gestütztem Live-Audit für Besucher.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Motion** (Framer Motion) für Animationen
- **lucide-react** Icons

## Features

- Dunkles Premium-Design, Mobile-First, vollständig responsiv
- KI-Website-Audit (`/api/audit`): prüft live Performance, Security-Header,
  SEO-Signale und UX der eingegebenen URL — mit Score, Befunden und Empfehlung
- Lead-Formular (`/api/contact`) mit optionaler Webhook-Weiterleitung
- SEO: Metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`
- Security: SSRF-Schutz im Audit, Rate-Limiting, Security-Header via
  `next.config.ts`

## Entwicklung

```bash
cd agency
npm install
npm run dev      # → http://localhost:3100
```

## Konfiguration (optional)

| Variable               | Zweck                                              |
| ---------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Kanonische URL für SEO/Sitemap (Default: norevan.digital) |
| `LEAD_WEBHOOK_URL`     | Webhook (Slack/n8n/Zapier/CRM), an den neue Anfragen gesendet werden |

## Build

```bash
npm run build && npm start
```
