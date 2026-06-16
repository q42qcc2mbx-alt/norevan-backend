// Shared API security helpers: in-memory rate limiting + honeypot check.

const buckets = new Map<string, Map<string, number[]>>();

/** Sliding-window rate limit per scope+key. Returns true when over the limit. */
export function rateLimited(scope: string, key: string, max: number, windowMs: number): boolean {
  let scopeMap = buckets.get(scope);
  if (!scopeMap) {
    scopeMap = new Map();
    buckets.set(scope, scopeMap);
  }
  const now = Date.now();
  const recent = (scopeMap.get(key) ?? []).filter((ts) => now - ts < windowMs);
  recent.push(now);
  scopeMap.set(key, recent);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (scopeMap.size > 5000) {
    for (const [k, v] of scopeMap) {
      if (v.every((ts) => now - ts >= windowMs)) scopeMap.delete(k);
    }
  }
  return recent.length > max;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Honeypot: the hidden "company" field is invisible to humans. Bots that fill
 * it get a fake success so they don't learn to adapt.
 */
export function isBot(body: Record<string, unknown> | null): boolean {
  return typeof body?.company === "string" && body.company.length > 0;
}

/** Trim, strip control characters and cap length. */
export function clean(value: unknown, maxLen: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
