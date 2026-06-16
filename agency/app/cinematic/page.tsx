import type { Metadata } from "next";
import Link from "next/link";
import CinematicStatue from "@/components/CinematicStatue";

export const metadata: Metadata = {
  title: "Cinematic — Lady Justice",
  description: "Scroll-Cinematic: Tausende Fragmente setzen sich zu Lady Justice zusammen.",
  robots: { index: false, follow: false },
};

export default function CinematicPage() {
  return (
    <div className="bg-[#0A0000]" dir="ltr">
      {/* Scroll-assembly experience */}
      <CinematicStatue />

      {/* Payoff once the statue is whole */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0000] px-6 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 40%, #4A0000 0%, #2A0000 40%, #0A0000 100%)",
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.4em] text-[#D85A5A] uppercase">
            NOREVAN Digital
          </p>
          <h2
            className="mt-5 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
            style={{ color: "#F1D6D6" }}
          >
            Wieder aufgebaut.{" "}
            <span style={{ color: "#D85A5A" }}>Stärker als zuvor.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed" style={{ color: "#A98" }}>
            Aus tausenden Fragmenten entsteht etwas Ganzes — so bauen wir Websites: präzise,
            kraftvoll und bis ins letzte Detail.
          </p>
          <Link
            href="/"
            className="mt-9 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(95deg,#7A1111,#A22A2A)", boxShadow: "0 10px 30px rgba(122,17,17,0.45)" }}
          >
            Zur Startseite
          </Link>
        </div>
      </section>
    </div>
  );
}
