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
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const promises = [
  { icon: Clock, text: "Antwort innerhalb von 24 Stunden" },
  { icon: ShieldCheck, text: "100% unverbindlich & DSGVO-konform" },
  { icon: CheckCircle2, text: "Persönliche Beratung statt Verkaufsdruck" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
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
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Senden fehlgeschlagen. Bitte erneut versuchen.",
      );
    }
  }

  return (
    <section id="kontakt" className="relative bg-card py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Kontakt"
          title="Bereit für eine Website, die liefert?"
          subtitle="Erzählen Sie uns von Ihrem Projekt — Sie erhalten innerhalb von 24 Stunden eine persönliche Antwort mit konkreten nächsten Schritten."
        />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-8">
          <Reveal>
            <div className="space-y-5">
              <article className="card bg-white p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <Mail className="h-5 w-5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-ink">E-Mail</h3>
                <a
                  href="mailto:kontakt@norevan.digital"
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  kontakt@norevan.digital
                </a>
              </article>

              <article className="card bg-white p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-cyan-glow/10 text-accent ring-1 ring-accent/15">
                  <ScanSearch className="h-5 w-5" />
                </span>
                <h3 className="mb-1 text-base font-semibold text-ink">
                  Lieber direkt analysieren?
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  Starten Sie mit der kostenlosen KI-Analyse — und erhalten Sie
                  sofort einen Überblick über Ihr Potenzial.
                </p>
                <a
                  href="#analyse"
                  className="mt-3 inline-block text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
                >
                  Zur kostenlosen Analyse →
                </a>
              </article>

              <ul className="space-y-3 px-1">
                {promises.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Icon className="h-4.5 w-4.5 shrink-0 text-accent" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="card-elevated p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
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
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
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
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
                    Nachricht
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    required
                    maxLength={5000}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Beschreiben Sie kurz Ihr Anliegen — z. B. welche Website es geht und was Sie erreichen möchten."
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
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {feedback}
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-center text-sm font-medium text-red-600">{feedback}</p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
