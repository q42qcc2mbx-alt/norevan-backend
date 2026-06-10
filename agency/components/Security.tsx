import {
  BadgeCheck,
  DatabaseBackup,
  FileSearch,
  Lock,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Reveal from "./ui/Reveal";

const items = [
  {
    icon: Lock,
    title: "SSL-Prüfung",
    text: "Wir prüfen Zertifikate, Verschlüsselung und HTTPS-Weiterleitungen — damit Browser Ihren Besuchern Vertrauen signalisieren statt Warnungen.",
  },
  {
    icon: FileSearch,
    title: "Sicherheitsanalyse",
    text: "Systematischer Check von Security-Headern, veralteter Software und typischen Schwachstellen wie XSS oder Injection-Angriffspunkten.",
  },
  {
    icon: ShieldCheck,
    title: "Schutz vor Angriffen",
    text: "Firewall-Konfiguration, Bot-Schutz, Rate-Limiting und Härtung — Ihre Website bleibt auch unter Beschuss erreichbar.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup-Strategien",
    text: "Automatisierte, getestete Backups mit klarem Wiederherstellungsplan. Im Ernstfall ist Ihre Website in Minuten wieder online.",
  },
  {
    icon: Scale,
    title: "DSGVO-Hinweise",
    text: "Cookie-Consent, Datenschutzerklärung, datensparsame Tools — wir zeigen Ihnen, wo rechtliche Risiken liegen und wie Sie sie beheben.",
  },
  {
    icon: BadgeCheck,
    title: "Laufendes Monitoring",
    text: "Uptime-Überwachung und Sicherheits-Alerts rund um die Uhr — Probleme erkennen wir, bevor Ihre Kunden sie bemerken.",
  },
];

export default function Security() {
  return (
    <section id="sicherheit" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_20%,rgba(56,225,255,0.06),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <span className="mb-4 inline-block rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-glow uppercase">
                Sicherheit
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Sicherheit ist kein Feature.{" "}
                <span className="text-gradient">Sie ist das Fundament.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-400 md:text-lg">
                Ein einziger erfolgreicher Angriff kann Jahre an Vertrauen
                zerstören. Wir sichern Ihre Website nach aktuellen Best
                Practices ab — präventiv, gründlich und nachvollziehbar
                dokumentiert.
              </p>
              <a
                href="#analyse"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-6 py-3 text-sm font-semibold text-cyan-glow transition-colors hover:bg-cyan-glow/20"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                Kostenlosen Security-Check starten
              </a>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {items.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <article className="card-glow h-full rounded-2xl p-6">
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-glow/12 text-cyan-glow">
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
