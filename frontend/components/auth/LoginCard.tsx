"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { cn } from "@/lib/cn";
import { getSupabaseClient } from "@/lib/supabase/client";

// ── View states ───────────────────────────────────────────────────────────────
type View =
  | "login"
  | "forgot-email"
  | "forgot-otp"
  | "forgot-newpw"
  | "register"
  | "register-done";

// ── Animation presets ─────────────────────────────────────────────────────────
const FADE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};
const T = { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] as const };

// ── Shared input style ────────────────────────────────────────────────────────
const INPUT =
  "h-12 w-full bg-transparent border-0 border-b border-foreground/25 text-foreground placeholder:text-foreground/35 px-1 py-2 text-base focus:outline-none focus:border-foreground/70 transition-colors";

// ── Icons ─────────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={T}
      className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-center font-mono text-[10px] leading-relaxed text-red-400"
    >
      {msg}
    </motion.p>
  );
}

function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeClosed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

type PwFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
  onEnter?: () => void;
};
function PwField({ label, value, onChange, show, onToggle, placeholder, autoComplete, onEnter }: PwFieldProps) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete ?? "current-password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
          className={cn(INPUT, "pr-10")}
          placeholder={placeholder ?? "••••••••"}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Passwort verstecken" : "Passwort anzeigen"}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors hover:text-foreground"
        >
          {show ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </div>
  );
}

function Divider({ label = "oder" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-foreground/12" />
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{label}</span>
      <div className="h-px flex-1 bg-foreground/12" />
    </div>
  );
}

function BackLink({ onClick, label = "← Zurück" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-center font-mono text-[10px] text-foreground/40 transition-colors hover:text-foreground"
    >
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function LoginCard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? `/${locale}`;

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const supabase = getSupabaseClient();

  function clearErr() { setError(null); }
  function go(v: View) { clearErr(); setView(v); }

  function parseError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("wrong"))
      return "Falsche E-Mail oder falsches Passwort.";
    if (m.includes("email not confirmed"))
      return "Bitte bestätige zuerst deine E-Mail.";
    if (m.includes("already registered") || m.includes("user already"))
      return "Diese E-Mail ist bereits registriert. Bitte melde dich an.";
    if (m.includes("rate") || m.includes("limit"))
      return "Zu viele Versuche. Bitte kurz warten.";
    if ((m.includes("invalid") && m.includes("otp")) || m.includes("expired"))
      return "Falscher oder abgelaufener Code.";
    if (m.includes("weak") && m.includes("password"))
      return "Passwort zu schwach. Mindestens 8 Zeichen.";
    if (m.includes("network") || m.includes("fetch"))
      return "Netzwerkfehler. Bitte erneut versuchen.";
    return msg;
  }

  function redirect() { router.push(nextPath); router.refresh(); }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSocialLogin(provider: "google" | "apple") {
    if (submitting) return;
    clearErr();
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (e) { setError(parseError(e.message)); setSubmitting(false); }
      // On success Supabase redirects the browser — no need to call redirect()
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setSubmitting(false);
    }
  }

  async function handleLogin() {
    if (submitting) return;
    clearErr();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Bitte eine gültige E-Mail eingeben."); return;
    }
    if (!password) { setError("Bitte Passwort eingeben."); return; }
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (e) setError(parseError(e.message)); else redirect();
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  async function handleForgotSend() {
    if (submitting) return;
    clearErr();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Bitte eine gültige E-Mail eingeben."); return;
    }
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      if (e) setError(parseError(e.message));
      else { setOtp(Array(6).fill("")); go("forgot-otp"); setTimeout(() => otpRefs.current[0]?.focus(), 60); }
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  async function handleForgotVerify(direct?: string[]) {
    if (submitting) return;
    const token = (direct ?? otp).join("");
    if (token.length < 6) return;
    clearErr();
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      if (e) {
        setError(parseError(e.message));
        setOtp(Array(6).fill(""));
        setTimeout(() => otpRefs.current[0]?.focus(), 60);
      } else { setPassword(""); setConfirmPw(""); go("forgot-newpw"); }
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  async function handleSetPassword() {
    if (submitting) return;
    clearErr();
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (password !== confirmPw) { setError("Passwörter stimmen nicht überein."); return; }
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.updateUser({ password });
      if (e) setError(parseError(e.message)); else redirect();
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  async function handleRegister() {
    if (submitting) return;
    clearErr();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Bitte eine gültige E-Mail eingeben."); return;
    }
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (password !== confirmPw) { setError("Passwörter stimmen nicht überein."); return; }
    setSubmitting(true);
    try {
      const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password });
      if (e) setError(parseError(e.message));
      else if (data.session) redirect();
      else go("register-done");
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  async function handleGuest() {
    if (submitting) return;
    clearErr();
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInAnonymously();
      if (e) setError(parseError(e.message)); else redirect();
    } catch { setError("Netzwerkfehler. Bitte erneut versuchen."); }
    finally { setSubmitting(false); }
  }

  // ── OTP handlers ─────────────────────────────────────────────────────────────
  function onOtpChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (digit && next.every((d) => d !== "")) handleForgotVerify(next);
  }
  function onOtpKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }
  function onOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill(""); p.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next); otpRefs.current[Math.min(p.length, 5)]?.focus();
    if (p.length === 6) handleForgotVerify(next);
  }

  // ── Heading per view ──────────────────────────────────────────────────────────
  const headings: Record<View, string> = {
    "login":         "Willkommen zurück.",
    "forgot-email":  "Passwort zurücksetzen",
    "forgot-otp":    "Code eingeben",
    "forgot-newpw":  "Neues Passwort",
    "register":      "Konto erstellen",
    "register-done": "Fast geschafft!",
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative w-full max-w-[360px] rounded-2xl border border-foreground/[0.1] bg-card px-8 py-10 shadow-sm"
    >
      {/* Heading */}
      <div className="mb-7 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/40">
          {dict.login.eyebrow}
        </span>
        <h1
          className="mt-2 text-[1.85rem] leading-tight text-foreground"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 400 }}
        >
          {headings[view]}
        </h1>
      </div>

      <AnimatePresence mode="wait" initial={false}>

        {/* ── LOGIN ──────────────────────────────────────────────────────── */}
        {view === "login" && (
          <motion.div key="login" {...FADE} transition={T} className="flex flex-col gap-4">

            {/* Social login buttons */}
            <motion.button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
            >
              <GoogleIcon />
              Mit Google anmelden
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
            >
              <AppleIcon />
              Mit Apple anmelden
            </motion.button>

            <Divider />

            {/* Email / password */}
            <div>
              <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">
                E-Mail
              </label>
              <input
                type="email" autoComplete="email" inputMode="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={INPUT} placeholder="you@example.com"
              />
            </div>

            <PwField
              label="Passwort" value={password} onChange={setPassword}
              show={showPw} onToggle={() => setShowPw(!showPw)}
              autoComplete="current-password" onEnter={handleLogin}
            />

            <button
              type="button"
              onClick={() => { clearErr(); go("forgot-email"); }}
              className="-mt-1 self-end font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40 transition-colors hover:text-foreground/70"
            >
              Passwort vergessen?
            </button>

            {error && <ErrorBox msg={error} />}

            <motion.button
              type="button" onClick={handleLogin}
              disabled={submitting || !email.trim() || !password}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Wird angemeldet…" : "Anmelden"}
            </motion.button>

            <Divider />

            <motion.button
              type="button" onClick={handleGuest} disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="h-11 w-full rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-all hover:border-foreground/45 hover:text-foreground disabled:opacity-40"
            >
              Als Gast fortfahren
            </motion.button>

            <p className="text-center font-mono text-[10px] text-foreground/40">
              Neu hier?{" "}
              <button
                type="button"
                onClick={() => { clearErr(); setPassword(""); setConfirmPw(""); go("register"); }}
                className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Konto erstellen →
              </button>
            </p>
          </motion.div>
        )}

        {/* ── FORGOT — enter email ─────────────────────────────────────── */}
        {view === "forgot-email" && (
          <motion.div key="forgot-email" {...FADE} transition={T} className="flex flex-col gap-5">
            <p className="font-mono text-[10px] leading-relaxed text-foreground/50">
              Gib deine E-Mail ein. Wir schicken dir einen 6-stelligen Code.
            </p>
            <div>
              <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">E-Mail</label>
              <input
                type="email" autoComplete="email" inputMode="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgotSend()}
                className={INPUT} placeholder="you@example.com"
              />
            </div>

            {error && <ErrorBox msg={error} />}

            <motion.button
              type="button" onClick={handleForgotSend}
              disabled={submitting || !email.trim()}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Wird gesendet…" : "Code senden"}
            </motion.button>

            <BackLink onClick={() => go("login")} label="← Zurück zum Login" />
          </motion.div>
        )}

        {/* ── FORGOT — enter OTP ──────────────────────────────────────── */}
        {view === "forgot-otp" && (
          <motion.div key="forgot-otp" {...FADE} transition={T}>
            <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              Code gesendet an
            </p>
            <p className="mb-6 truncate text-center font-mono text-[11px] text-foreground/75">
              {email.trim()}
            </p>

            <div className="grid grid-cols-6 gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => onOtpKey(idx, e)}
                  onPaste={idx === 0 ? onOtpPaste : undefined}
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  aria-label={`Ziffer ${idx + 1}`}
                  className={cn(
                    "h-12 w-full rounded-lg border text-center font-mono text-lg text-foreground transition-colors focus:outline-none focus:border-foreground",
                    digit ? "border-foreground/55 bg-foreground/8" : "border-foreground/20 bg-transparent",
                  )}
                />
              ))}
            </div>

            {error && <div className="mt-4"><ErrorBox msg={error} /></div>}

            <motion.button
              type="button" onClick={() => handleForgotVerify()}
              disabled={submitting || otp.join("").length < 6}
              whileTap={{ scale: 0.98 }}
              className="mt-6 h-12 w-full rounded-full bg-white font-mono text-[11px] uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Wird geprüft…" : "Bestätigen"}
            </motion.button>

            <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
              <button type="button" onClick={() => go("forgot-email")} className="transition-colors hover:text-foreground">
                ← Zurück
              </button>
              <button type="button" onClick={handleForgotSend} disabled={submitting} className="transition-colors hover:text-foreground disabled:opacity-35">
                Erneut senden
              </button>
            </div>
          </motion.div>
        )}

        {/* ── FORGOT — set new password ────────────────────────────────── */}
        {view === "forgot-newpw" && (
          <motion.div key="forgot-newpw" {...FADE} transition={T} className="flex flex-col gap-5">
            <p className="font-mono text-[10px] leading-relaxed text-foreground/50">
              Code bestätigt. Lege jetzt dein neues Passwort fest.
            </p>

            <PwField
              label="Neues Passwort" value={password} onChange={setPassword}
              show={showPw} onToggle={() => setShowPw(!showPw)}
              autoComplete="new-password" placeholder="Mindestens 8 Zeichen"
            />
            <PwField
              label="Passwort wiederholen" value={confirmPw} onChange={setConfirmPw}
              show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
              autoComplete="new-password" onEnter={handleSetPassword}
            />

            {error && <ErrorBox msg={error} />}

            <motion.button
              type="button" onClick={handleSetPassword}
              disabled={submitting || password.length < 8 || !confirmPw}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Wird gespeichert…" : "Passwort speichern"}
            </motion.button>
          </motion.div>
        )}

        {/* ── REGISTER ─────────────────────────────────────────────────── */}
        {view === "register" && (
          <motion.div key="register" {...FADE} transition={T} className="flex flex-col gap-4">

            {/* Social register */}
            <motion.button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
            >
              <GoogleIcon />
              Mit Google registrieren
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
            >
              <AppleIcon />
              Mit Apple registrieren
            </motion.button>

            <Divider />

            <div>
              <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">E-Mail</label>
              <input
                type="email" autoComplete="email" inputMode="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={INPUT} placeholder="you@example.com"
              />
            </div>

            <PwField
              label="Passwort" value={password} onChange={setPassword}
              show={showPw} onToggle={() => setShowPw(!showPw)}
              autoComplete="new-password" placeholder="Mindestens 8 Zeichen"
            />
            <PwField
              label="Passwort wiederholen" value={confirmPw} onChange={setConfirmPw}
              show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
              autoComplete="new-password" onEnter={handleRegister}
            />

            {error && <ErrorBox msg={error} />}

            <motion.button
              type="button" onClick={handleRegister}
              disabled={submitting || !email.trim() || password.length < 8 || !confirmPw}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Wird erstellt…" : "Konto erstellen"}
            </motion.button>

            <p className="text-center font-mono text-[10px] text-foreground/40">
              Schon ein Konto?{" "}
              <button type="button" onClick={() => go("login")}
                className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Anmelden →
              </button>
            </p>
          </motion.div>
        )}

        {/* ── REGISTER DONE ──────────────────────────────────────────────── */}
        {view === "register-done" && (
          <motion.div key="register-done" {...FADE} transition={T} className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-foreground/15 text-3xl text-foreground/60">
              ✉
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-foreground/55">
              Wir haben dir eine Bestätigungs-E-Mail geschickt.<br />
              Öffne sie und klicke auf den Link — danach kannst du dich anmelden.
            </p>
            <BackLink onClick={() => go("login")} label="Zum Login" />
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
