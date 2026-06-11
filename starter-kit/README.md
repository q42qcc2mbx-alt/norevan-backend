# Website-AI Starter Kit

Ein fertiges Grundgerüst für eine Website, auf der sich Kunden anmelden, ihr
Gerät wählen (Handy / Tablet / PC) und eine **KI** nutzen, die ihnen
**konkrete Verbesserungs-Texte für ihre eigene Website schreibt** — zum
Kopieren mit einem Klick. Mit **Rollen** (Kunde / Admin / Owner) und einem
rollenbasierten Dashboard.

Herausgelöst & generisch gemacht aus dem Norevan-Shop — ohne Shop-Bezug,
sofort für ein neues Projekt verwendbar.

---

## Was drin ist

| Datei | Zweck |
|---|---|
| `lib/auth-context.tsx` | Rollen (`customer` / `admin` / `owner`) + React-Context (`useAuth`) |
| `lib/roles.ts` | Rechte-Helfer + rollenbasierte Navigation (`navFor`) |
| `lib/device-store.ts` | Geräteauswahl (Handy/Tablet/PC), Auto-Erkennung + localStorage |
| `lib/session.ts` | Liest die Session aus dem Cookie (server-seitig) |
| `components/DeviceChooser.tsx` | Erstbesuch: „Wie nutzt du die Seite?" |
| `components/LoginForm.tsx` | Anmelden / Registrieren |
| `components/DashboardShell.tsx` | Rollen-Layout (Topbar, Sidebar, mobile Tableiste) |
| `components/AiWebsiteHelper.tsx` | **Kernstück:** KI-Eingabe → Verbesserungstext + Kopieren |
| `app/api/ai/route.ts` | KI-Endpoint (Claude) — erzeugt den Text |
| `app/api/auth/{login,register,logout}/route.ts` | Auth-Routen (Stub — an deine DB anbinden) |
| `app/login/page.tsx` · `app/dashboard/page.tsx` | Beispielseiten, fertig verdrahtet |

---

## Schnellstart

```bash
# 1) In einen neuen Next.js-Ordner kopieren (oder direkt als Projekt nutzen)
npm install

# 2) API-Schlüssel hinterlegen
cp .env.example .env.local
#   ANTHROPIC_API_KEY=sk-ant-...   (console.anthropic.com → API Keys, + Guthaben)

# 3) Starten
npm run dev
#   → http://localhost:3000/login
```

**Test-Login (Stub):** beliebige E-Mail + Passwort. Die Rolle ergibt sich aus
der E-Mail: `owner@…` → Owner, `admin@…` → Admin, alles andere → Kunde.

---

## So funktioniert die KI

`AiWebsiteHelper` (Kunde gibt URL/Beschreibung + Fokus ein) → `POST /api/ai` →
Claude antwortet mit fertigen, kopierbaren Verbesserungen (Texte, SEO, Design,
Conversion …). Modell & Prompt steckst du in `app/api/ai/route.ts`.

> ⚠️ **In Produktion:** In `app/api/ai/route.ts` zuerst die Session prüfen
> (`getSessionUser()`), sonst können Nicht-angemeldete deine KI-Kosten
> verursachen.

---

## Anpassen

- **Echte Anmeldung:** Ersetze die Stub-Routen in `app/api/auth/*` durch deine
  Nutzer-DB (z. B. Supabase oder Postgres + bcrypt). `getSessionUser()` an dein
  Session-/JWT-Format anpassen.
- **Rollen & Menü:** in `lib/roles.ts` (`navFor`) bearbeiten.
- **Design:** Tailwind-Klassen anpassen; Branding in `DashboardShell` („YourBrand").
- **Mehr KI-Funktionen:** weitere Routen nach dem Muster von `app/api/ai`.

---

## Voraussetzungen

Next.js (App Router), React 19, Tailwind v4, `@anthropic-ai/sdk`. Alle Versionen
stehen in `package.json`. Benötigt einen **Claude-API-Schlüssel** mit Guthaben.
