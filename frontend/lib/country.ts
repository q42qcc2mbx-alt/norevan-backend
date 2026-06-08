// Normalize a free-text country value to an ISO 3166-1 alpha-2 code.
//
// Order rows have historically stored the country in mixed forms — an ISO code
// ("DE") or a localized name ("Deutschland", "deutschland") depending on how the
// address was captured. The dashboard normalizes before aggregating/mapping so
// "Deutschland" and "DE" don't split into two buckets.

const NAME_TO_ISO: Record<string, string> = {
  // ── German names ──
  deutschland: "DE",
  österreich: "AT",
  oesterreich: "AT",
  schweiz: "CH",
  frankreich: "FR",
  italien: "IT",
  niederlande: "NL",
  belgien: "BE",
  luxemburg: "LU",
  spanien: "ES",
  portugal: "PT",
  "vereinigtes königreich": "GB",
  "vereinigtes koenigreich": "GB",
  großbritannien: "GB",
  grossbritannien: "GB",
  irland: "IE",
  dänemark: "DK",
  daenemark: "DK",
  schweden: "SE",
  norwegen: "NO",
  finnland: "FI",
  polen: "PL",
  tschechien: "CZ",
  slowakei: "SK",
  ungarn: "HU",
  slowenien: "SI",
  kroatien: "HR",
  rumänien: "RO",
  rumaenien: "RO",
  bulgarien: "BG",
  griechenland: "GR",
  island: "IS",
  estland: "EE",
  lettland: "LV",
  litauen: "LT",
  serbien: "RS",
  "vereinigte staaten": "US",
  usa: "US",
  // ── English names ──
  germany: "DE",
  austria: "AT",
  switzerland: "CH",
  france: "FR",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  luxembourg: "LU",
  spain: "ES",
  "united kingdom": "GB",
  "great britain": "GB",
  ireland: "IE",
  denmark: "DK",
  sweden: "SE",
  norway: "NO",
  finland: "FI",
  poland: "PL",
  "czech republic": "CZ",
  czechia: "CZ",
  slovakia: "SK",
  hungary: "HU",
  slovenia: "SI",
  croatia: "HR",
  romania: "RO",
  bulgaria: "BG",
  greece: "GR",
  iceland: "IS",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  serbia: "RS",
  "united states": "US",
};

export function toISOCountry(value: string | null | undefined): string {
  if (!value) return "??";
  const trimmed = value.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  const iso = NAME_TO_ISO[trimmed.toLowerCase()];
  return iso ?? trimmed.toUpperCase();
}
