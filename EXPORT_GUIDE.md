# NOREVAN — Vollständiger Website-Export (Anleitung)

Dieses **gesamte Repository** IST der vollständige Export der Norevan-Plattform
(Online-Shop + Back-Office + KI). Nichts ausgelassen außer `node_modules/`
(Bibliotheken — per `npm install` wiederherstellbar) und Build-Artefakten
(`.next/`). Jede Komponente, Seite, API-Route, DB-Migration, Konfiguration,
jedes Bild und jeder Asset ist enthalten.

> **So lädst du alles herunter:** Auf GitHub oben rechts auf den grünen Button
> **„Code" → „Download ZIP"**. Das ZIP enthält genau diesen kompletten Quellcode.

> **Für die nächste KI / den nächsten Entwickler:** Diese Datei ist deine
> Landkarte. Lies sie zuerst, dann findest du jede Funktion in Sekunden.

---

## 1. Architektur (3 Teile)

```
  [ Frontend ]            [ Backend ]               [ Datenbank ]
  Next.js 16 (App     →   Express (server.js)   →   Supabase PostgreSQL
  Router), React 19       REST /api/v1/*             (+ Supabase Auth für
  → Vercel                → Render                    Kunden-Login)
```

- **Frontend** (`frontend/`): der gesamte sichtbare Shop + das Admin/Owner-
  Back-Office + die KI „JARVIS". Läuft auf **Vercel**.
- **Backend** (`server.js` + `controllers/` `routes/` `services/`
  `middleware/`): REST-API (Produkte, Bestellungen, Auth, Analytics, E-Mails,
  Stripe-Webhook). Läuft auf **Render** (`render.yaml`).
- **Datenbank**: Supabase PostgreSQL. Schema = `db/migrations/*.sql` (der
  Reihe nach anwenden).

Zwei Auth-Systeme: **Kunden** über Supabase (Frontend), **Back-Office**
(owner/admin/staff/viewer) über eigenes JWT gegen die Backend-`users`-Tabelle.

---

## 2. Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, cacheComponents) |
| UI | React 19, Tailwind CSS v4, Framer Motion (`motion/react`), next-themes |
| Karte | Leaflet + react-leaflet (CARTO-Tiles) |
| Backend | Node.js (ESM) + Express |
| DB | Supabase PostgreSQL (`pg`), Supabase Auth |
| Zahlungen | Stripe (Checkout + Webhook) |
| E-Mail | Nodemailer (SMTP) + pdfkit (PDF-Rechnung) |
| KI | `@anthropic-ai/sdk` (Claude) — JARVIS & Website-Helfer |
| Deploy | Vercel (Frontend), Render (Backend), GitHub Actions |

---

## 3. Ordnerstruktur (Überblick)

```
norevan/
├─ server.js                  # Express-Einstieg
├─ render.yaml                # Backend-Deploy (Render)
├─ package.json               # Backend-Abhängigkeiten + Tests
├─ controllers/               # Backend-Logik (Produkte, Bestellungen, Auth …)
├─ routes/                    # Express-Routen (/api/v1/*)
├─ services/                  # emailService, stripeService, invoiceService
├─ middleware/                # Auth, Rollen, Rate-Limit, Cron-Secret, Security
├─ config/                    # DB-Pool, Konfiguration
├─ db/migrations/             # 13 SQL-Migrationen = komplettes Schema
├─ scripts/                   # Seed (Produkte + Admin)
├─ test/                      # Backend-Tests (node --test)
├─ docs/                      # Doku + Supabase-E-Mail-Templates
├─ .github/workflows/         # CI + Deploy + Cron-Jobs (Tagesreport etc.)
├─ starter-kit/               # Eigenständiges KI-Website-Helfer-Kit (2. Projekt)
└─ frontend/
   ├─ app/                    # Next.js App Router
   │  ├─ [lang]/              # Storefront (de/en): Shop, Produkt, Cart, Checkout …
   │  ├─ admin/               # Back-Office (Login, Dashboard, Analytics, Live-Karte,
   │  │                       #   Team, Protokoll, Produkte, Bestellungen, JARVIS)
   │  ├─ api/                 # Next-API-Routen (admin, auth, checkout, jarvis, ai …)
   │  ├─ rbac/                # Rollen-Demo (Customer/Admin/Owner)
   │  ├─ auth/                # Supabase OAuth-Callback
   │  ├─ manifest.ts          # PWA-Manifest
   │  ├─ robots.ts, sitemap   # SEO
   │  └─ globals.css          # ALLE Farben, Fonts, Animationen, JARVIS-Styles
   ├─ components/             # Alle React-Komponenten (siehe Feature-Map)
   ├─ lib/                    # Datenzugriff, Auth, i18n, Stores, Helfer
   ├─ public/                 # ALLE Bilder, Logos, Produktfotos, sw.js (Service Worker)
   └─ proxy.ts                # Middleware: Sprache nach Land + Login-Wall
```

---

## 4. Feature-Map (wo finde ich was?)

| Funktion | Pfad |
|---|---|
| **Farben / Fonts / Animationen** | `frontend/app/globals.css` (CSS-Variablen, Dark-Mode, JARVIS-Glow) |
| **Storefront** (Startseite, Shop, Produkt, Warenkorb, Checkout) | `frontend/app/[lang]/*` |
| **Produktsuche + Größenfilter** | `frontend/components/product/CategoryFilter.tsx` |
| **Produktkarte** (Sterne, „Nur noch X") | `frontend/components/product/ProductCard.tsx` |
| **Rich Snippets / SEO (JSON-LD)** | `frontend/lib/seo.tsx` |
| **PWA (App installieren)** | `frontend/components/pwa/PWA.tsx`, `frontend/public/sw.js`, `frontend/app/manifest.ts` |
| **Newsletter-Popup + Willkommensrabatt** | `frontend/components/marketing/NewsletterPopup.tsx` |
| **Login-Wall + Sprache nach Land** | `frontend/proxy.ts` |
| **Admin/Owner-Dashboard** | `frontend/app/admin/(authed)/page.tsx` |
| **Analytics + Heatmap + Umsatz nach Land** | `frontend/app/admin/(authed)/analytics/page.tsx` |
| **Echte Geo-Karte (Standorte) + Live-Bestellungen** | `frontend/app/admin/(authed)/live/page.tsx`, `frontend/components/admin/Leaflet*`, `LiveOrders.tsx` |
| **Rechnung als PDF (Ansicht)** | `frontend/app/admin/(authed)/orders/[id]/invoice/page.tsx` |
| **Rollen (RBAC)** | `frontend/lib/auth/admin.ts`, `frontend/app/rbac/*` |
| **Hell-/Dunkelmodus** | `frontend/components/providers/ThemeProvider.tsx`, `components/layout/ThemeToggle.tsx` |
| **Geräteerkennung (Handy/PC) + App-Modus** | `frontend/components/device/*`, `frontend/lib/device-store.ts` |
| **JARVIS OMEGA (Owner-KI)** | `frontend/app/admin/(authed)/jarvis/page.tsx`, `frontend/components/admin/jarvis/*`, `frontend/app/api/admin/jarvis/*`, `frontend/lib/jarvis/*` |
| **KI-Website-Helfer (wiederverwendbar)** | `starter-kit/` (eigenständiges Kit für ein zweites Projekt) |
| **Bestell-Benachrichtigung + Tagesreport (E-Mail)** | `services/emailService.js`, `controllers/orderController.js`, `.github/workflows/daily-summary.yml` |
| **Echte Marge/Gewinn (Einkaufspreis)** | Backend `controllers/productController.js`, Frontend Analytics |
| **„Kunden kauften auch"** | Backend `getAlsoBought`, Frontend `frontend/lib/products.ts` |
| **Rabattcodes** | `controllers/discountController.js`, DB-Tabelle `discount_codes` |
| **Stripe-Zahlung + Webhook** | `services/stripeService.js`, `controllers/paymentController.js` |
| **Sicherheit** | `middleware/` (authMiddleware, requireRole, requireCronSecret, rateLimit, securityHardening) |

---

## 5. Lokal starten

### Backend (Express)
```bash
npm install
cp .env.example .env        # Variablen unten setzen
node server.js              # läuft auf Port 4000 (Standard)
npm test                    # 17 Tests
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
npm run build               # Produktions-Build (96 Seiten)
```

---

## 6. Umgebungsvariablen

**Backend** (Render / `.env`):
```
DATABASE_URL=postgres://…              # Supabase Postgres
JWT_SECRET=…                           # Back-Office-JWT (muss zum Frontend passen)
JWT_EXPIRES_IN=24h
CORS_ORIGINS=https://deine-domain
GMAIL_USER=…  GMAIL_APP_PASSWORD=…     # SMTP für E-Mails (oder SMTP_HOST/PORT)
MAIL_FROM="Norevan <hello@…>"
ORDER_NOTIFY_EMAIL=…                   # wohin Bestell-/Tagesreport-Mails gehen
STRIPE_SECRET_KEY=…  STRIPE_WEBHOOK_SECRET=…
CRON_SECRET=…                          # schützt /tasks/* (Cron-Jobs)
FRONTEND_URL=https://deine-domain
```

**Frontend** (Vercel):
```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…            # Newsletter + JARVIS-Speicher (server-only)
JWT_SECRET=…                           # identisch zum Backend
API_URL=https://norevan-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://deine-domain
ANTHROPIC_API_KEY=sk-ant-…             # JARVIS & KI-Helfer (mit Guthaben)
```

---

## 7. Datenbank

Schema = `db/migrations/001…013_*.sql` **der Reihe nach** ausführen:
```bash
for f in db/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
node scripts/seed.js          # Produkte + Standard-Admin anlegen
```
Wichtige Tabellen: `products` (inkl. `cost_cents`), `orders`, `order_items`,
`users` (Rollen), `reviews`, `discount_codes`, `newsletter_subscribers`,
`jarvis_messages` / `jarvis_memory` / `jarvis_tasks`.

---

## 8. Deploy

- **Frontend → Vercel:** Root Directory = `frontend`. Deploy via GitHub Actions
  (`.github/workflows/deploy-frontend.yml`, braucht Repo-Secret `VERCEL_TOKEN`)
  oder Vercel-Git-Integration. „Vercel Authentication" in den Projekt-Settings
  ausschalten, damit die Seite öffentlich ist.
- **Backend → Render:** `render.yaml` (Auto-Deploy bei Push auf `main`).
- **Cron-Jobs** (GitHub Actions): Tagesreport, Warenkorb-Erinnerung, Keep-Alive
  — nutzen Repo-Secret `CRON_SECRET`.

---

## 9. Hinweise

- **Zugangsdaten** stehen aus Sicherheitsgründen NICHT im Code — Back-Office-
  Logins liegen in der DB-Tabelle `users` (Passwörter bcrypt-gehasht).
- `PLAN.md` / `README.md` / `docs/` enthalten weitere Projektnotizen.
- `starter-kit/` ist ein **eigenständiges** Mini-Projekt (Anmeldung + Rollen +
  Geräteauswahl + KI-Website-Helfer) — für ein zweites Vorhaben gedacht.

Damit lässt sich die komplette Website ohne Informationsverlust weiterführen.
