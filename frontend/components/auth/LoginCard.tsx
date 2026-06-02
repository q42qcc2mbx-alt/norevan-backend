"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { cn } from "@/lib/cn";
import { getSupabaseClient } from "@/lib/supabase/client";

// ── View states ───────────────────────────────────────────────────────────────
// Passwordless: enter email → receive a 6-digit code → verify. The same flow
// signs in returning users and creates new ones (shouldCreateUser: true).
type View = "email" | "otp";

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

function Divider({ label = "oder" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-foreground/12" />
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{label}</span>
      <div className="h-px flex-1 bg-foreground/12" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function LoginCard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? `/${locale}`;
  const isDe = locale === "de";

  const [view, setView] = useState<View>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const supabase = getSupabaseClient();

  function clearErr() { setError(null); }
  function go(v: View) { clearErr(); setView(v); }

  function parseError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes("rate") || m.includes("limit"))
      return isDe ? "Zu viele Versuche. Bitte kurz warten." : "Too many attempts. Please wait a moment.";
    if ((m.includes("invalid") && m.includes("otp")) || m.includes("expired") || m.includes("token"))
      return isDe ? "Falscher oder abgelaufener Code." : "Wrong or expired code.";
    if (m.includes("network") || m.includes("fetch"))
      return isDe ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.";
    if (m.includes("signups") && m.includes("disabled"))
      return isDe ? "Registrierung ist derzeit deaktiviert." : "Sign-ups are currently disabled.";
    return msg;
  }

  function redirect() { router.push(nextPath); router.refresh(); }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSocialLogin(provider: "google") {
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
      // On success Supabase redirects the browser.
    } catch {
      setError(isDe ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleSendCode() {
    if (submitting) return;
    clearErr();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(isDe ? "Bitte eine gültige E-Mail eingeben." : "Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (e) setError(parseError(e.message));
      else {
        setOtp(Array(6).fill(""));
        go("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 60);
      }
    } catch {
      setError(isDe ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(direct?: string[]) {
    if (submitting) return;
    const token = (direct ?? otp).join("");
    if (token.length < 6) return;
    clearErr();
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      });
      if (e) {
        setError(parseError(e.message));
        setOtp(Array(6).fill(""));
        setTimeout(() => otpRefs.current[0]?.focus(), 60);
      } else {
        redirect();
      }
    } catch {
      setError(isDe ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuest() {
    if (submitting) return;
    clearErr();
    setSubmitting(true);
    try {
      const { error: e } = await supabase.auth.signInAnonymously();
      if (e) setError(parseError(e.message)); else redirect();
    } catch {
      setError(isDe ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── OTP handlers ─────────────────────────────────────────────────────────────
  function onOtpChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (digit && next.every((d) => d !== "")) handleVerify(next);
  }
  function onOtpKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }
  function onOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill(""); p.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next); otpRefs.current[Math.min(p.length, 5)]?.focus();
    if (p.length === 6) handleVerify(next);
  }

  // ── Heading per view ──────────────────────────────────────────────────────────
  const headings: Record<View, string> = {
    email: isDe ? "Anmelden" : "Sign in",
    otp: isDe ? "Code eingeben" : "Enter code",
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

        {/* ── EMAIL ──────────────────────────────────────────────────────── */}
        {view === "email" && (
          <motion.div key="email" {...FADE} transition={T} className="flex flex-col gap-4">

            <motion.button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
            >
              <GoogleIcon />
              {isDe ? "Mit Google fortfahren" : "Continue with Google"}
            </motion.button>

            <Divider label={isDe ? "oder" : "or"} />

            <div>
              <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">
                E-Mail
              </label>
              <input
                type="email" autoComplete="email" inputMode="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                className={INPUT} placeholder="you@example.com"
              />
            </div>

            <p className="-mt-1 font-mono text-[10px] leading-relaxed text-foreground/45">
              {isDe
                ? "Wir senden dir einen 6-stelligen Code per E-Mail. Kein Passwort nötig."
                : "We'll email you a 6-digit code. No password needed."}
            </p>

            {error && <ErrorBox msg={error} />}

            <motion.button
              type="button" onClick={handleSendCode}
              disabled={submitting || !email.trim()}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? (isDe ? "Wird gesendet…" : "Sending…") : (isDe ? "Code senden" : "Send code")}
            </motion.button>

            <Divider label={isDe ? "oder" : "or"} />

            <motion.button
              type="button" onClick={handleGuest} disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="h-11 w-full rounded-full border border-foreground/20 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-all hover:border-foreground/45 hover:text-foreground disabled:opacity-40"
            >
              {isDe ? "Als Gast fortfahren" : "Continue as guest"}
            </motion.button>
          </motion.div>
        )}

        {/* ── OTP ────────────────────────────────────────────────────────── */}
        {view === "otp" && (
          <motion.div key="otp" {...FADE} transition={T}>
            <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              {isDe ? "Code gesendet an" : "Code sent to"}
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
                  aria-label={`${isDe ? "Ziffer" : "Digit"} ${idx + 1}`}
                  className={cn(
                    "h-12 w-full rounded-lg border text-center font-mono text-lg text-foreground transition-colors focus:outline-none focus:border-foreground",
                    digit ? "border-foreground/55 bg-foreground/8" : "border-foreground/20 bg-transparent",
                  )}
                />
              ))}
            </div>

            {error && <div className="mt-4"><ErrorBox msg={error} /></div>}

            <motion.button
              type="button" onClick={() => handleVerify()}
              disabled={submitting || otp.join("").length < 6}
              whileTap={{ scale: 0.98 }}
              className="mt-6 h-12 w-full rounded-full bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? (isDe ? "Wird geprüft…" : "Verifying…") : (isDe ? "Bestätigen" : "Confirm")}
            </motion.button>

            <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
              <button type="button" onClick={() => go("email")} className="transition-colors hover:text-foreground">
                {isDe ? "← Zurück" : "← Back"}
              </button>
              <button type="button" onClick={handleSendCode} disabled={submitting} className="transition-colors hover:text-foreground disabled:opacity-35">
                {isDe ? "Erneut senden" : "Resend"}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
