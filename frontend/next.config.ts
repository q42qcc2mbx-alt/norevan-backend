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

const nextConfig: NextConfig = {
  cacheComponents: true,
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
