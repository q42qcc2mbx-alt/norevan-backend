import { ImageResponse } from "next/og";

// Branded browser-tab favicon (the N monogram in the brand gradient).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #a22a2a, #d85a5a)",
          borderRadius: 14,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
