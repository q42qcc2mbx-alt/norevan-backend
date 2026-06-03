import type { NextConfig } from "next";

// Pin the Supabase storage hostname (from NEXT_PUBLIC_SUPABASE_URL) as a
// trusted Image source. Falls back to a *.supabase.co wildcard when the env
// isn't set yet (initial typecheck before .env.local).
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

// Security headers applied to every response. No blocking CSP here (Next's
// inline runtime would need per-request nonces); these are the safe, high-value
// ones. Geolocation is allowed for the "use my location" address helper.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      supabaseHost
        ? {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          }
        : {
            protocol: "https",
            hostname: "*.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
    ],
  },
};

export default nextConfig;
