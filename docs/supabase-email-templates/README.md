# Supabase Auth — gebrandete E-Mail-Vorlagen (Norevan)

Die **kundenseitige** Authentifizierung (Registrierung, Magic-Link, Passwort-Reset,
E-Mail-Änderung) läuft über **Supabase**. Supabase verschickt diese Mails selbst —
sie lassen sich nur über die Dashboard-Config gestalten, nicht per Migration/SQL.

Hier liegen fertige HTML-Vorlagen im Norevan-Stil (dunkler Header, Gold-Wortmarke,
Ivory-Body), passend zu `services/emailService.js`.

## Einsetzen (einmalig, ~2 Min.)

1. Supabase-Dashboard → **Authentication → Emails → Templates**.
2. Für jede Vorlage den passenden HTML-Inhalt aus diesem Ordner kopieren:

   | Supabase-Template      | Datei hier              |
   |------------------------|-------------------------|
   | Confirm signup         | `confirm-signup.html`   |
   | Magic Link             | `magic-link.html`       |
   | Reset Password         | `recovery.html`         |
   | Change Email Address   | `email-change.html`     |

3. Den **Subject** je Template setzen (Vorschlag steht oben in jeder Datei als
   HTML-Kommentar).
4. Speichern. Optional: in **Authentication → Emails → SMTP Settings** einen
   eigenen Absender (z. B. `hello@norevan.shop`) hinterlegen, sonst kommt die
   Mail vom Supabase-Default-Absender.

## Variablen

Supabase ersetzt diese Platzhalter automatisch:

- `{{ .ConfirmationURL }}` — fertiger Bestätigungs-/Reset-/Login-Link (wird in
  allen Vorlagen als Button verwendet).
- `{{ .Token }}` / `{{ .TokenHash }}` — 6-stelliger Code bzw. Hash (falls du
  lieber einen Code statt Link nutzt).
- `{{ .SiteURL }}`, `{{ .Email }}` — Site-Basis-URL bzw. Empfänger-Adresse.

> Hinweis: Die `{{ ... }}`-Platzhalter müssen **wörtlich** erhalten bleiben —
> nicht ersetzen, Supabase füllt sie beim Versand.
