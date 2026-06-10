"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, MessageSquareText, Send } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", website: "", message: "" });
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
      setForm({ name: "", email: "", website: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Senden fehlgeschlagen. Bitte erneut versuchen.",
      );
    }
  }

  return (
    <section id="kontakt" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_100%,rgba(91,108,255,0.1),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Kontakt"
          title="Bereit für eine Website, die liefert?"
          subtitle="Erzählen Sie uns von Ihrem Projekt — Sie erhalten innerhalb von 24 Stunden eine persönliche Antwort mit konkreten nächsten Schritten."
        />

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="space-y-5">
              <article className="card-glow rounded-2xl p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-soft">
                  <Mail className="h-5.5 w-5.5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-white">E-Mail</h3>
                <a
                  href="mailto:kontakt@norevan.digital"
                  className="text-sm text-slate-400 transition-colors hover:text-accent-soft"
                >
                  kontakt@norevan.digital
                </a>
              </article>
              <article className="card-glow rounded-2xl p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-soft">
                  <MessageSquareText className="h-5.5 w-5.5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-white">
                  Lieber direkt analysieren?
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Starten Sie mit der kostenlosen KI-Analyse — und erhalten Sie
                  sofort einen Überblick über Ihr Potenzial.
                </p>
                <a
                  href="#analyse"
                  className="mt-3 inline-block text-sm font-semibold text-accent-soft transition-colors hover:text-white"
                >
                  Zur kostenlosen Analyse →
                </a>
              </article>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="card-glow rounded-3xl p-7 md:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Max Mustermann"
                    className="w-full rounded-xl border border-edge bg-night-soft px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                    E-Mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="max@firma.de"
                    className="w-full rounded-xl border border-edge bg-night-soft px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-website" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Website <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="contact-website"
                    type="text"
                    maxLength={300}
                    inputMode="url"
                    value={form.website}
                    onChange={update("website")}
                    placeholder="www.ihre-website.de"
                    className="w-full rounded-xl border border-edge bg-night-soft px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Nachricht
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    maxLength={5000}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Beschreiben Sie kurz Ihr Anliegen …"
                    className="w-full resize-none rounded-xl border border-edge bg-night-soft px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Wird gesendet …
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Anfrage senden
                  </>
                )}
              </button>

              {status === "sent" && (
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {feedback}
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-center text-sm text-red-400">{feedback}</p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
