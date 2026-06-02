"use client";

import { useState } from "react";
import type { AddressPick } from "@/components/checkout/AddressAutocomplete";

type PhotonProps = {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  country?: string;
};

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/**
 * Asks the browser for the visitor's location (native "Allow?" prompt), then
 * reverse-geocodes it via Photon (komoot/OSM, no key — same provider as the
 * address autocomplete) and hands the result to `onPick`. Best-effort: any
 * denial or failure surfaces a gentle hint and leaves manual entry untouched.
 */
export function UseMyLocationButton({
  onPick,
  locale,
  className,
}: {
  onPick: (a: AddressPick) => void;
  locale: "de" | "en";
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "locating" | "error">("idle");
  const isDe = locale === "de";

  function run() {
    if (state === "locating") return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState("error");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}&lang=de`,
          );
          const data = (await res.json()) as {
            features?: { properties?: PhotonProps }[];
          };
          const p = data.features?.[0]?.properties ?? {};
          const base = p.street || p.name || "";
          const hn = p.housenumber ? ` ${p.housenumber}` : "";
          onPick({
            street: `${base}${hn}`.trim(),
            zip: p.postcode || "",
            city: p.city || p.town || p.village || p.municipality || p.county || "",
            country: p.country || "",
          });
          setState("idle");
        } catch {
          setState("error");
        }
      },
      () => setState("error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={run}
        disabled={state === "locating"}
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground disabled:opacity-50"
      >
        <PinIcon />
        {state === "locating"
          ? isDe
            ? "Wird ermittelt…"
            : "Locating…"
          : isDe
            ? "Standort verwenden"
            : "Use my location"}
      </button>
      {state === "error" && (
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted">
          {isDe
            ? "Standort nicht verfügbar — bitte Adresse manuell eingeben."
            : "Location unavailable — please enter your address manually."}
        </p>
      )}
    </div>
  );
}
