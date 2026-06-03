import { ImageResponse } from "next/og";

// Default social-share card for the site (WhatsApp, X, Google, etc.).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Norevan — Premium Streetwear";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a14",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 96, letterSpacing: 18, fontWeight: 700 }}>
          NOR<span style={{ color: "#c8a96a" }}>E</span>VAN
        </div>
        <div
          style={{
            marginTop: 28,
            height: 3,
            width: 120,
            background: "#c8a96a",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#8a8a93",
          }}
        >
          Premium Streetwear · Berlin
        </div>
      </div>
    ),
    size,
  );
}
