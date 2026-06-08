"use client";

import dynamic from "next/dynamic";

export type SalesPoint = {
  city: string;
  country: string;
  lat: number;
  lon: number;
  cents: number;
  count: number;
};

// Leaflet must not run on the server (it needs `window`), so load the actual
// map client-side only.
const LeafletSalesMap = dynamic(() => import("./LeafletSalesMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[460px] place-items-center rounded-md border border-border bg-card text-sm text-muted">
      Karte lädt…
    </div>
  ),
});

export function SalesGeoMap({ points }: { points: SalesPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="grid h-[460px] place-items-center rounded-md border border-border bg-card text-sm text-muted">
        Noch keine verortbaren Verkäufe.
      </div>
    );
  }
  return <LeafletSalesMap points={points} />;
}
