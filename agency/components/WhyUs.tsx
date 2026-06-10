import {
  Gauge,
  ShieldCheck,
  Search,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

const reasons = [
  {
    icon: Gauge,
    title: "Website-Geschwindigkeit optimieren",
    text: "Jede Sekunde Ladezeit kostet bis zu 7% Conversion. Wir bringen Ihre Seite auf unter eine Sekunde — mit Caching, CDN und modernem Code.",
  },
  {
    icon: ShieldCheck,
    title: "Sicherheitslücken erkennen & schließen",
    text: "Wir prüfen Ihre Website auf Schwachstellen, härten Server und Code und schützen Sie zuverlässig vor Angriffen und Datenverlust.",
  },
  {
    icon: Search,
    title: "SEO verbessern",
    text: "Technisches SEO, Struktur und Inhalte — wir sorgen dafür, dass Google Sie findet und Ihre Kunden Sie zuerst sehen.",
  },
  {
    icon: Sparkles,
    title: "Benutzererfahrung modernisieren",
    text: "Veraltetes Design schreckt ab. Wir gestalten klare, moderne Interfaces, die Besucher intuitiv ans Ziel führen.",
  },
  {
    icon: TrendingUp,
    title: "Conversion-Rate steigern",
    text: "Aus Besuchern werden Kunden: durchdachte Call-to-Actions, optimierte Funnels und datenbasierte Verbesserungen.",
  },
  {
    icon: Wrench,
    title: "Technische Fehler beheben",
    text: "Kaputte Links, Fehlermeldungen, Darstellungsprobleme — wir finden und beheben, was Ihre Website ausbremst.",
  },
];

export default function WhyUs() {
  return (
    <section id="warum-wir" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Warum wir?"
          title="Ihre Website kann mehr — wir beweisen es."
          subtitle="Sechs Hebel, mit denen wir aus jeder Website eine Plattform machen, die schneller lädt, besser rankt und mehr verkauft."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <article className="card-glow h-full rounded-2xl p-7">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-soft">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2.5 text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
