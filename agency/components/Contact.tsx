"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  ScanSearch,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import { useI18n } from "@/lib/i18n";

const promiseIcons = [Clock, ShieldCheck, CheckCircle2];

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Senden fehlgeschlagen.");
      setStatus("sent");
      setFeedback(data.message);
      setForm({ name: "", email: "", message: "", company: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Senden fehlgeschlagen. Bitte erneut versuchen.",
      );
    }
  }

  return (
    <section id="kontakt" className="relative bg-card py-12 md:py-24">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-8">
          <Reveal>
            <div className="space-y-5">
              <article className="card-surface p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Mail className="h-5 w-5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-ink">{t.contact.email}</h3>
                <a
                  href="mailto:kontakt@norevan.digital"
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  kontakt@norevan.digital
                </a>
              </article>

              <article className="card-surface p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <ScanSearch className="h-5 w-5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-ink">{t.contact.preferAnalysis}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{t.contact.preferAnalysisText}</p>
                <Link
                  href="/analyse"
                  className="mt-3 inline-block text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
                >
                  {t.contact.toAnalysis}
                </Link>
              </article>

              <ul className="space-y-3 px-1">
                {t.contact.promises.map((text, i) => {
                  const Icon = promiseIcons[i];
                  return (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                      <Icon className="h-4.5 w-4.5 shrink-0 text-accent" />
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="card-elevated p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
                    {t.contact.name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    placeholder={t.contact.namePh}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
                    {t.contact.email}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder={t.contact.emailPh}
                    className="field"
                  />
                </div>
                {/* Honeypot — invisible to humans; bots that fill it are rejected */}
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={update("company")}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="sr-only"
                />
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
                    {t.contact.message}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    required
                    maxLength={5000}
                    value={form.message}
                    onChange={update("message")}
                    placeholder={t.contact.messagePh}
                    className="field resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {t.contact.send}
                  </>
                )}
              </button>

              {status === "sent" && (
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {feedback}
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-center text-sm font-medium text-red-500">{feedback}</p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
