import type { Metadata } from "next";
import CinematicStatue from "@/components/CinematicStatue";
import FunnelHero from "@/components/funnel/FunnelHero";
import CostOfInaction from "@/components/funnel/CostOfInaction";
import FounderTeam from "@/components/funnel/FounderTeam";
import FunnelFaq from "@/components/funnel/FunnelFaq";

// The landing page IS the lead-magnet funnel: one URL field above the fold,
// a real scan, then the e-mail gate. Distraction-free by design — the marketing
// sub-pages (/leistungen, /portfolio, …) stay reachable directly.
export const metadata: Metadata = {
  title: "Kostenlose Website-Analyse in 30 Sekunden",
  description:
    "Finden Sie in 30 Sekunden heraus, warum Ihre Website Kunden verliert — und was es Sie kostet. Kostenlose, KI-gestützte Analyse. DSGVO-konform, Server in der EU.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wie viel Umsatz verliert Ihre Website – jeden Tag?",
    description:
      "Kostenlose 30-Sekunden-Analyse: Wir zeigen Ihnen die kritischen Schwachstellen, die Sie Kunden kosten. Unverbindlich & DSGVO-konform.",
  },
  twitter: {
    title: "Wie viel Umsatz verliert Ihre Website – jeden Tag?",
    description:
      "Kostenlose 30-Sekunden-Analyse Ihrer Website. Finden Sie die Conversion-Killer, bevor es Ihr Wettbewerber tut.",
  },
};

export default function Home() {
  return (
    <>
      <CinematicStatue scrollVh={240} />
      <FunnelHero />
      <CostOfInaction />
      <FounderTeam />
      <FunnelFaq />
    </>
  );
}
