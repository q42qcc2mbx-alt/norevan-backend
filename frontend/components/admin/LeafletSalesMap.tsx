"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useTheme } from "next-themes";
import { formatPrice } from "@/lib/format";
import type { SalesPoint } from "./SalesGeoMap";

// Geographic sales map. Rendered client-only (see SalesGeoMap) because Leaflet
// touches `window`. Each city is a green circle sized by realized revenue.
export default function LeafletSalesMap({ points }: { points: SalesPoint[] }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const center: LatLngExpression = points.length
    ? [points[0].lat, points[0].lon]
    : [51.1, 10.4]; // Germany
  const maxCents = Math.max(1, ...points.map((p) => p.cents));

  return (
    <div className="overflow-hidden rounded-md border border-border" style={{ height: 460 }}>
      <MapContainer
        center={center}
        zoom={points.length > 1 ? 5 : 6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "var(--muted-bg)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        {points.map((p) => {
          const radius = 9 + (p.cents / maxCents) * 20;
          return (
            <CircleMarker
              key={`${p.city}-${p.country}`}
              center={[p.lat, p.lon]}
              radius={radius}
              pathOptions={{
                color: "#15803d",
                fillColor: "#22c55e",
                fillOpacity: 0.55,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <span style={{ fontWeight: 600 }}>{p.city}</span>
                <br />
                {formatPrice(p.cents, "de")} · {p.count}{" "}
                {p.count === 1 ? "Bestellung" : "Bestellungen"}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
