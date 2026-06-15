// Google PageSpeed Insights (Lighthouse) — real mobile performance score,
// Core Web Vitals and a screenshot of the page. Best-effort: returns null on
// any error/timeout so the analysis still works without it. Uses
// PAGESPEED_API_KEY if set (higher rate limits); works without a key at low
// volume too.

export interface PageSpeedResult {
  score: number; // Google performance score 0–100
  lcpMs?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  tbtMs?: number; // Total Blocking Time (responsiveness proxy)
  fcpMs?: number; // First Contentful Paint
  screenshot?: string; // data:image/jpeg;base64,… (final screenshot)
}

const TIMEOUT_MS = 14_000;

function normalize(input: string): string {
  const t = input.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

interface LhAudit {
  numericValue?: number;
  details?: { data?: string };
}

export async function runPageSpeed(rawUrl: string): Promise<PageSpeedResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const params = new URLSearchParams({ url: normalize(rawUrl), strategy: "mobile" });
    params.append("category", "performance");
    if (process.env.PAGESPEED_API_KEY) params.append("key", process.env.PAGESPEED_API_KEY);

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      { signal: controller.signal },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, LhAudit>;
      };
    };

    const lh = data.lighthouseResult;
    const score = lh?.categories?.performance?.score;
    if (typeof score !== "number") return null;
    const audits = lh?.audits ?? {};

    return {
      score: Math.round(score * 100),
      lcpMs: audits["largest-contentful-paint"]?.numericValue,
      cls: audits["cumulative-layout-shift"]?.numericValue,
      tbtMs: audits["total-blocking-time"]?.numericValue,
      fcpMs: audits["first-contentful-paint"]?.numericValue,
      screenshot: audits["final-screenshot"]?.details?.data,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
