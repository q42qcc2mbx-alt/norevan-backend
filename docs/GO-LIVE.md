# Go-Live: Zustellbarkeit, Backups & Monitoring

Diese Datei deckt die „🟡 empfohlenen" Schritte vor dem Launch ab. Der Code ist
vorbereitet — hier stehen die Konfigurationsschritte (Dashboard/DNS), die nur du
mit deinen Zugängen ausführen kannst.

---

## 1. E-Mail-Zustellbarkeit (SPF / DKIM / DMARC)

Ohne diese DNS-Einträge landen Bestellbestätigungen & Auth-Mails oft im Spam.

### Schritt 1 — Branded Absender setzen
Setze im Backend (Render) die Variable:

```
MAIL_FROM=Norevan <hello@norevan.shop>
```

Der Code nutzt das jetzt überall (Bestellbestätigung, Willkommen, Login,
Warenkorb-Erinnerung, Team-Einladung). Ohne die Variable wird die Gmail-Adresse
verwendet — funktioniert, wirkt aber unprofessionell und ist schlechter
zustellbar.

### Schritt 2 — DNS-Einträge bei deinem Domain-Provider

Beispiel für **Gmail / Google Workspace** als Versender (`norevan.shop`):

| Typ  | Name/Host            | Wert |
|------|----------------------|------|
| TXT  | `@`                  | `v=spf1 include:_spf.google.com ~all` |
| TXT  | `google._domainkey`  | (DKIM-Schlüssel aus der Google-Admin-Konsole → Apps → Gmail → Authentifizieren) |
| TXT  | `_dmarc`             | `v=DMARC1; p=quarantine; rua=mailto:dmarc@norevan.shop; adkim=s; aspf=s` |

> Versendest du über **Resend/Postmark/SES** statt Gmail, nutze deren
> SPF-`include:` und den von ihnen erzeugten DKIM-CNAME. Setze dann im Backend
> `SMTP_HOST`/`SMTP_PORT` (siehe `.env.example`) auf den Provider.

### Schritt 3 — Testen
Sende eine Testbestellung und prüfe die Mail mit
[mail-tester.com](https://www.mail-tester.com) (Ziel: 10/10) oder schau in den
Mail-Header (`SPF=pass`, `DKIM=pass`, `DMARC=pass`).

### Empfehlung
Für höheres Volumen → **Resend** oder **Postmark**: bessere Zustellraten,
einfaches DKIM-Setup, Bounce-/Open-Tracking. Der Wechsel ist nur eine
Env-Änderung (`SMTP_HOST`, `SMTP_PORT`, `GMAIL_USER`/`GMAIL_APP_PASSWORD` =
Provider-Credentials).

---

## 2. Datenbank-Backups (Supabase)

- **Supabase Dashboard → Database → Backups.**
- Free-Plan: tägliche Backups (begrenzte Aufbewahrung). Für einen echten Shop
  **Pro-Plan** mit **Point-in-Time-Recovery (PITR)** aktivieren — damit kannst
  du auf jeden Zeitpunkt zurückspielen, nicht nur auf das letzte Tages-Backup.
- Optional: regelmäßig einen Logical Dump ziehen
  (`pg_dump "$DATABASE_URL" > backup.sql`) und extern ablegen.
- Die SQL-Migrationen liegen versioniert in `db/migrations/` — das Schema ist
  also jederzeit reproduzierbar.

---

## 3. Fehler-Monitoring (Sentry)

Der Code ist bereits integriert (`config/monitoring.js`) und **komplett inaktiv,
solange `SENTRY_DSN` nicht gesetzt ist**.

### Backend (Render)
1. Lege auf [sentry.io](https://sentry.io) ein Projekt an (Plattform: Node.js).
2. Kopiere den DSN und setze im Backend:
   ```
   SENTRY_DSN=https://xxxx@oXXX.ingest.sentry.io/XXX
   SENTRY_TRACES_SAMPLE_RATE=0.1   # optional, Performance-Sampling
   ```
3. Beim nächsten Deploy meldet der Server unbehandelte Fehler, 500er-Antworten
   und `unhandledRejection`/`uncaughtException` automatisch an Sentry.

### Frontend (Vercel) — optional
Für client-/SSR-seitige Fehler im Next.js-Frontend:
```
cd frontend && npx @sentry/wizard@latest -i nextjs
```
Der Wizard legt die nötigen Configs an und fragt nach dem (separaten)
Frontend-DSN. Danach in Vercel als Env-Variable hinterlegen.

> Alternative ganz ohne Zusatzdienst: Render- und Vercel-Logs +
> Uptime-Monitoring (z. B. UptimeRobot auf `/api/v1/products`).

---

## 4. Sicherheit (wichtig!)

Der Code & die DB wurden gehärtet (Security-Header, Stripe-Customer ohne
Kartendaten, konstantzeit-Cron-Secret, Supabase-Advisor-Fixes). **Zwei** Dinge
musst du noch im Dashboard erledigen:

1. **`SUPABASE_SERVICE_ROLE_KEY` in Vercel setzen (Pflicht).**
   Die Tabelle `newsletter_subscribers` ist jetzt komplett gegen die öffentliche
   API gesperrt (vorher konnte **jeder** mit dem Anon-Key alle E-Mail-Adressen
   auslesen — das ist behoben). Newsletter-An-/Abmeldung und die Admin-Liste
   laufen jetzt nur noch über den **Service-Role-Key**. Ohne ihn ist der
   Newsletter deaktiviert (gibt 503 zurück).
   → Supabase Dashboard → **Settings → API → `service_role` secret** kopieren,
   in Vercel als `SUPABASE_SERVICE_ROLE_KEY` hinterlegen. **Niemals** im
   Frontend-Client verwenden (nur Server/Route-Handler).

2. **Leaked-Password-Schutz aktivieren.**
   Supabase Dashboard → **Authentication → Policies/Settings** → „Leaked password
   protection" einschalten (prüft Passwörter gegen HaveIBeenPwned).

### Stripe-Webhook
Der Endpoint im Backend ist **`https://<backend>/api/v1/stripe/webhook`**
(Event `checkout.session.completed`). Signing-Secret als
`STRIPE_WEBHOOK_SECRET` setzen.

> Hinweis: Die verbleibenden „Anonymous Access"-Hinweise im Supabase-Advisor
> sind **gewollt** — der Shop nutzt anonyme Gast-Sessions (Browsen ohne Login)
> und der Produktkatalog ist öffentlich lesbar. Alle Kundendaten (orders,
> profiles) sind per `auth.uid()` auf die eigene Zeile beschränkt.

## 5. Uptime / Keep-Alive

Bereits erledigt ✅ — `.github/workflows/keep-alive.yml` pingt täglich die API,
damit das Supabase-Projekt nicht pausiert. Ergänzend kannst du einen externen
Uptime-Monitor (UptimeRobot/BetterStack) auf die Domain legen.
