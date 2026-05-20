"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export function NewsletterSection({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const t = {
    de: {
      eyebrow: "Letter",
      title: "Bleib im Loop.",
      body: "Eine E-Mail im Monat. Neue Drops, Atelier-Notizen, frühe Zugänge. Kein Spam, niemals.",
      placeholder: "Deine E-Mail",
      cta: "Abonnieren",
      thanks: "Eingetragen. Bis bald.",
      consent:
        "Mit dem Abonnieren stimmst du unseren Datenschutzhinweisen zu.",
    },
    en: {
      eyebrow: "Letter",
      title: "Stay in the loop.",
      body: "One email per month. New drops, atelier notes, early access. Never spam.",
      placeholder: "Your email",
      cta: "Subscribe",
      thanks: "You're in. See you soon.",
      consent:
        "By clicking subscribe, you agree to our privacy notice.",
    },
  }[locale];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="border-y border-border-subtle bg-background py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="eyebrow">{t.eyebrow}</span>
          <h2
            className="headline mt-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
          >
            {t.title}
          </h2>
          <p className="body-soft mx-auto mt-5 max-w-md text-base leading-[1.65]">
            {t.body}
          </p>
        </motion.div>

        {!submitted ? (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              className="h-12 flex-1 rounded-full border border-border bg-card px-5 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
              autoComplete="email"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
            >
              {t.cta}
              <span aria-hidden>→</span>
            </motion.button>
          </form>
        ) : (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground"
          >
            ✓  {t.thanks}
          </motion.p>
        )}

        <p className="mx-auto mt-6 max-w-sm font-mono text-[9px] uppercase tracking-[0.25em] text-muted">
          {t.consent}
        </p>
      </div>
    </section>
  );
}
