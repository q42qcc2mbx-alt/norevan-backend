"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// Lets a logged-in user change their own e-mail and password via Supabase Auth.
// Password changes take effect immediately; e-mail changes require confirming
// the link Supabase sends to the new address.

type Note = { kind: "ok" | "err"; text: string } | null;

export default function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [emailNote, setEmailNote] = useState<Note>(null);
  const [pwNote, setPwNote] = useState<Note>(null);

  async function changeEmail(e: FormEvent) {
    e.preventDefault();
    setEmailNote(null);
    const email = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setEmailNote({ kind: "err", text: "Bitte geben Sie eine gültige E-Mail-Adresse ein." });
      return;
    }
    setEmailBusy(true);
    const { error } = await getSupabase().auth.updateUser({ email });
    setEmailBusy(false);
    if (error) {
      setEmailNote({ kind: "err", text: error.message });
      return;
    }
    setNewEmail("");
    setEmailNote({
      kind: "ok",
      text: "Fast geschafft: Wir haben einen Bestätigungslink an die neue Adresse gesendet. Klicken Sie ihn an, um die Änderung abzuschließen.",
    });
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwNote(null);
    if (pw.length < 8) {
      setPwNote({ kind: "err", text: "Das Passwort muss mindestens 8 Zeichen haben." });
      return;
    }
    if (pw !== pw2) {
      setPwNote({ kind: "err", text: "Die beiden Passwörter stimmen nicht überein." });
      return;
    }
    setPwBusy(true);
    const { error } = await getSupabase().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) {
      setPwNote({ kind: "err", text: error.message });
      return;
    }
    setPw("");
    setPw2("");
    setPwNote({ kind: "ok", text: "Passwort erfolgreich geändert ✓" });
  }

  const noteClass = (n: Note) =>
    `mt-2 text-xs font-medium ${n?.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`;

  return (
    <div className="card-elevated p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <ShieldCheck className="h-4.5 w-4.5 text-accent" />
        Konto-Einstellungen
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Angemeldet als <span className="font-medium text-ink">{currentEmail}</span>
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {/* Change e-mail */}
        <form onSubmit={changeEmail} className="space-y-3">
          <label htmlFor="acc-email" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Mail className="h-4 w-4 text-accent" />
            E-Mail ändern
          </label>
          <input
            id="acc-email"
            type="email"
            autoComplete="email"
            maxLength={200}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="neue@email.de"
            className="field"
          />
          <button
            type="submit"
            disabled={emailBusy}
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {emailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "E-Mail aktualisieren"}
          </button>
          {emailNote && <p className={noteClass(emailNote)}>{emailNote.text}</p>}
        </form>

        {/* Change password */}
        <form onSubmit={changePassword} className="space-y-3">
          <label htmlFor="acc-pw" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <KeyRound className="h-4 w-4 text-accent" />
            Passwort ändern
          </label>
          <input
            id="acc-pw"
            type="password"
            autoComplete="new-password"
            maxLength={200}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Neues Passwort (mind. 8 Zeichen)"
            className="field"
          />
          <input
            id="acc-pw2"
            type="password"
            autoComplete="new-password"
            maxLength={200}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Neues Passwort wiederholen"
            className="field"
          />
          <button
            type="submit"
            disabled={pwBusy}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Passwort ändern"}
          </button>
          {pwNote && <p className={noteClass(pwNote)}>{pwNote.text}</p>}
        </form>
      </div>
    </div>
  );
}
