import "server-only";

// Lightweight forward geocoder used by the back-office sales map. Resolves a
// free-text place ("Berlin 10115 Deutschland") to coordinates via Photon (the
// same open OSM-based service the checkout autocomplete uses — no API key).
// Results are memoised per warm server instance so repeated dashboard loads
// don't re-hit the API.

type Point = { lat: number; lon: number };

const cache = new Map<string, Point | null>();

export async function geocode(query: string): Promise<Point | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lang=de`;
    const res = await fetch(url, {
      headers: { "User-Agent": "norevan-backoffice" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: number[] } }[];
    };
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      cache.set(key, null);
      return null;
    }
    const point: Point = { lat: Number(coords[1]), lon: Number(coords[0]) };
    cache.set(key, point);
    return point;
  } catch {
    cache.set(key, null);
    return null;
  }
}
