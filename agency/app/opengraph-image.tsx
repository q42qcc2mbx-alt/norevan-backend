import { ImageResponse } from "next/og";

// Branded social-share card (WhatsApp, LinkedIn, X, Google). Next.js serves
// this automatically as og:image and twitter:image for the whole site.
export const alt = "NOREVAN Digital — Schnelle, sichere & erfolgreiche Websites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0a0f1d 0%, #101729 55%, #0e1b33 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24">
              <path
                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                fill="white"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 700 }}>
            <span style={{ color: "#e8edf7" }}>NOREVAN</span>
            <span style={{ color: "#60a5fa", marginLeft: 12 }}>Digital</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.12,
              maxWidth: 920,
            }}
          >
            Schnelle, sichere &amp; erfolgreiche Websites
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#a8b5cc" }}>
            Entwicklung · Performance · Sicherheit · KI
          </div>
        </div>

        {/* CTA pill */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(37, 99, 235, 0.18)",
              border: "1px solid rgba(96, 165, 250, 0.45)",
              color: "#bfdbfe",
              fontSize: 27,
              fontWeight: 600,
              padding: "13px 26px",
              borderRadius: 999,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22d3ee",
              }}
            />
            Kostenlose KI-Website-Analyse in 30 Sekunden
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
