"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";

export function LoginCard({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(`/${locale}`);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Ungültige E-Mail oder Passwort");
        setSubmitting(false);
      }
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setSubmitting(false);
    }
  }

  const inputCls =
    "h-11 w-full bg-transparent border-0 border-b border-white/30 text-white placeholder:text-white/40 px-1 py-2 text-sm focus:outline-none focus:border-white transition-colors";

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative w-full max-w-sm rounded-md border border-white/15 bg-black/55 p-9 backdrop-blur-2xl"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/logo/norevan.png"
          alt="Norevan"
          width={140}
          height={70}
          className="mb-4 h-14 w-auto"
        />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/60"
        >
          {dict.login.eyebrow}
        </span>
        <h1
          className="mt-3 font-serif text-3xl text-white"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          {dict.login.title}
        </h1>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
            {dict.login.email}
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@norevan.com"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
            {dict.login.password}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-center font-mono text-[10px] text-red-400">
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-full bg-white px-6 font-mono text-[11px] uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? dict.login.signingIn : dict.login.signIn}
        {!submitting && <span aria-hidden>→</span>}
      </motion.button>

      <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
        <button type="button" className="hover:text-white">
          {dict.login.forgot}
        </button>
        <button type="button" className="hover:text-white">
          {dict.login.register} →
        </button>
      </div>

      <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
        {dict.login.demoNote}
      </p>
    </motion.form>
  );
}
