import Hero from "@/components/Hero";
import ServicesCompact from "@/components/ServicesCompact";
import StatsStrip from "@/components/StatsStrip";
import CtaBanner from "@/components/CtaBanner";

// Deliberately short landing page: hero answers who/what/how, the compact
// tiles and the stats strip build trust, the banner converts. Everything
// else lives on the sub-pages.
export default function Home() {
  return (
    <>
      <Hero />
      <ServicesCompact />
      <StatsStrip />
      <CtaBanner />
    </>
  );
}
