"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bug, CheckCircle2, Lightbulb, Loader2, Mail, MessageSquareHeart, Send, Star, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type FbType = "fehler" | "vorschlag" | "bewertung";

export default function FeedbackWidget({ trigger }: { trigger?: "link" | "button" }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [typ, setTyp] = useState<FbType>("vorschlag");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const types: { id: FbType; label: string; icon: typeof Bug }[] = [
    { id: "fehler", label: t.feedback.typeError, icon: Bug },
    { id: "vorschlag", label: t.feedback.typeIdea, icon: Lightbulb },
    { id: "bewertung", label: t.feedback.typeRating, icon: Star },
  ];

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ, rating: typ === "bewertung" ? rating : null, message, email, company }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
      setEmail("");
      setRating(0);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {trigger === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
        >
          <MessageSquareHeart className="h-4 w-4 text-accent" />
          {t.feedback.open}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          {t.feedback.open}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t.feedback.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="card-elevated max-h-[85dvh] w-full max-w-md overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">{t.feedback.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{t.feedback.subtitle}</p>
                </div>
                <button
                  type="button"
                  aria-label={t.feedback.close}
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {status === "sent" ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <p className="mt-3 text-base font-semibold text-ink">{t.feedback.thanks}</p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {types.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTyp(id)}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          typ === id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-edge bg-card text-ink-soft hover:border-accent/40"
                        }`}
                      >
                        <Icon className="mx-auto h-5 w-5" />
                        <span className="mt-1 block text-xs font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>

                  {typ === "bewertung" && (
                    <div>
                      <span className="mb-1.5 block text-sm font-medium text-ink">{t.feedback.rating}</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            aria-label={`${n}/5`}
                            onClick={() => setRating(n)}
                            className="p-0.5"
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                n <= rating ? "fill-amber-400 text-amber-400" : "text-edge"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="fb-message" className="mb-1.5 block text-sm font-medium text-ink">
                      {t.feedback.message}
                    </label>
                    <textarea
                      id="fb-message"
                      rows={4}
                      required
                      maxLength={3000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.feedback.messagePh}
                      className="field resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="fb-email" className="mb-1.5 block text-sm font-medium text-ink">
                      {t.feedback.emailOptional}
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      maxLength={200}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@mail.com"
                      className="field"
                    />
                  </div>

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  {status === "error" && (
                    <p className="text-sm font-medium text-red-500">Fehler — bitte erneut versuchen.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Send className="h-4.5 w-4.5" />
                    )}
                    {status === "sending" ? t.feedback.sending : t.feedback.send}
                  </button>

                  <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t.feedback.note}{" "}
                      <a href="mailto:kontakt@norevan.digital" className="font-medium text-accent hover:underline">
                        kontakt@norevan.digital
                      </a>
                    </span>
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
