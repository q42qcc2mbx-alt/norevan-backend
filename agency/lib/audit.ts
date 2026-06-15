export type AuditSeverity = "critical" | "warning" | "good";

export interface AuditFinding {
  category: "Performance" | "Sicherheit" | "SEO" | "UX" | "Conversion";
  severity: AuditSeverity;
  title: string;
  detail: string;
}

export interface AuditResult {
  url: string;
  score: number;
  loadTimeMs: number;
  htmlSizeKb: number;
  findings: AuditFinding[];
  summary: string;
}

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 2_000_000;

function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Nur HTTP(S)-URLs werden unterstützt.");
  }
  return url;
}

/** Block requests to private/internal hosts (SSRF protection). */
function assertPublicHost(url: URL) {
  const host = url.hostname.toLowerCase();
  const privatePatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,
    /^0\./,
    /^\[?::1\]?$/,
    /^\[?f[cd][0-9a-f]{2}:/i,
    /\.local$/,
    /\.internal$/,
  ];
  if (!host.includes(".") || privatePatterns.some((p) => p.test(host))) {
    throw new Error("Diese Adresse kann nicht analysiert werden.");
  }
}

async function fetchSite(url: URL) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = performance.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NorevanAudit/1.0; +https://norevan.digital)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const reader = res.body?.getReader();
    let html = "";
    let bytes = 0;
    if (reader) {
      const decoder = new TextDecoder();
      while (bytes < MAX_HTML_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    }
    const loadTimeMs = Math.round(performance.now() - start);
    return { res, html, bytes, loadTimeMs };
  } finally {
    clearTimeout(timer);
  }
}

export async function runAudit(rawUrl: string): Promise<AuditResult> {
  const url = normalizeUrl(rawUrl);
  assertPublicHost(url);

  const { res, html, bytes, loadTimeMs } = await fetchSite(url);
  const headers = res.headers;
  const findings: AuditFinding[] = [];
  const lower = html.toLowerCase();

  // --- Performance ---
  if (loadTimeMs > 3000) {
    findings.push({
      category: "Performance",
      severity: "critical",
      title: "Sehr langsame Serverantwort",
      detail: `Die Seite benötigte ${(loadTimeMs / 1000).toFixed(1)}s bis zur Antwort. Besucher springen bereits nach 3 Sekunden ab — hier geht messbar Umsatz verloren.`,
    });
  } else if (loadTimeMs > 1200) {
    findings.push({
      category: "Performance",
      severity: "warning",
      title: "Verbesserungsfähige Ladezeit",
      detail: `Antwortzeit von ${(loadTimeMs / 1000).toFixed(1)}s gemessen. Mit Caching, CDN und Optimierung sind unter 0,5s realistisch.`,
    });
  } else {
    findings.push({
      category: "Performance",
      severity: "good",
      title: "Schnelle Serverantwort",
      detail: `Erste Antwort in ${loadTimeMs}ms — eine solide Basis.`,
    });
  }

  const htmlSizeKb = Math.round(bytes / 1024);
  if (htmlSizeKb > 500) {
    findings.push({
      category: "Performance",
      severity: "warning",
      title: "Großes HTML-Dokument",
      detail: `${htmlSizeKb} KB HTML deuten auf unnötigen Ballast hin. Schlankes Markup verbessert Ladezeit und Crawling.`,
    });
  }

  const contentEncoding = headers.get("content-encoding") ?? "";
  if (!/(br|gzip|zstd)/.test(contentEncoding)) {
    findings.push({
      category: "Performance",
      severity: "warning",
      title: "Keine Komprimierung erkannt",
      detail:
        "Die Antwort wird unkomprimiert ausgeliefert. Brotli/Gzip reduziert die Übertragungsgröße um bis zu 80%.",
    });
  }

  // --- Sicherheit ---
  if (url.protocol !== "https:" || !res.url.startsWith("https:")) {
    findings.push({
      category: "Sicherheit",
      severity: "critical",
      title: "Keine sichere HTTPS-Verbindung",
      detail:
        "Die Seite ist ohne SSL/TLS erreichbar. Browser warnen Besucher aktiv — ein massiver Vertrauens- und Ranking-Nachteil.",
    });
  } else {
    findings.push({
      category: "Sicherheit",
      severity: "good",
      title: "SSL/TLS aktiv",
      detail: "Die Verbindung ist verschlüsselt.",
    });
  }

  const securityHeaders: Array<[string, string]> = [
    ["strict-transport-security", "HSTS erzwingt dauerhaft HTTPS."],
    ["content-security-policy", "CSP schützt vor Cross-Site-Scripting (XSS)."],
    ["x-content-type-options", "Verhindert MIME-Sniffing-Angriffe."],
    ["x-frame-options", "Schützt vor Clickjacking via iFrames."],
  ];
  const missing = securityHeaders.filter(([name]) => !headers.get(name));
  if (missing.length >= 3) {
    findings.push({
      category: "Sicherheit",
      severity: "critical",
      title: `${missing.length} kritische Security-Header fehlen`,
      detail: `Fehlend: ${missing.map(([n]) => n).join(", ")}. Die Seite ist anfälliger für XSS, Clickjacking und Downgrade-Angriffe.`,
    });
  } else if (missing.length > 0) {
    findings.push({
      category: "Sicherheit",
      severity: "warning",
      title: `${missing.length} Security-Header fehlen`,
      detail: missing.map(([n, why]) => `${n} — ${why}`).join(" "),
    });
  } else {
    findings.push({
      category: "Sicherheit",
      severity: "good",
      title: "Security-Header gesetzt",
      detail: "Die wichtigsten Schutz-Header sind vorhanden.",
    });
  }

  const serverHeader = headers.get("server") ?? "";
  if (/\d/.test(serverHeader) || /x-powered-by/i.test([...headers.keys()].join(","))) {
    findings.push({
      category: "Sicherheit",
      severity: "warning",
      title: "Server verrät Versionsdetails",
      detail:
        "Header wie 'Server' oder 'X-Powered-By' geben Angreifern Hinweise auf verwundbare Software-Versionen.",
    });
  }

  // --- SEO ---
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";
  if (!title) {
    findings.push({
      category: "SEO",
      severity: "critical",
      title: "Kein Seitentitel gefunden",
      detail:
        "Ohne <title> kann Google die Seite nicht sinnvoll in Suchergebnissen anzeigen.",
    });
  } else if (title.length < 15 || title.length > 70) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Seitentitel nicht optimal",
      detail: `Der Titel hat ${title.length} Zeichen — ideal sind 30–60 Zeichen mit relevanten Keywords.`,
    });
  }

  if (!/<meta[^>]+name=["']description["']/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "critical",
      title: "Meta-Description fehlt",
      detail:
        "Ohne Beschreibung entscheidet Google selbst, was im Suchergebnis steht — das kostet Klickrate.",
    });
  }

  if (!/<h1[\s>]/i.test(lower)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Keine H1-Überschrift",
      detail:
        "Eine klare H1 hilft Suchmaschinen, das Hauptthema der Seite zu verstehen.",
    });
  }

  if (!/<meta[^>]+property=["']og:/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Open-Graph-Tags fehlen",
      detail:
        "Beim Teilen auf Social Media erscheint die Seite ohne Vorschaubild und Beschreibung.",
    });
  }

  // --- UX ---
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    findings.push({
      category: "UX",
      severity: "critical",
      title: "Nicht für Mobilgeräte optimiert",
      detail:
        "Der Viewport-Tag fehlt — auf Smartphones wird die Seite verkleinert und schwer bedienbar dargestellt. Über 60% der Besucher kommen mobil.",
    });
  }

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgsWithoutAlt = imgTags.filter((t) => !/\balt=/i.test(t)).length;
  if (imgTags.length > 0 && imgsWithoutAlt / imgTags.length > 0.4) {
    findings.push({
      category: "UX",
      severity: "warning",
      title: "Bilder ohne Alt-Texte",
      detail: `${imgsWithoutAlt} von ${imgTags.length} Bildern haben keinen Alt-Text — schlecht für Barrierefreiheit und Bilder-SEO.`,
    });
  }

  if (!/<html[^>]+lang=/i.test(html)) {
    findings.push({
      category: "UX",
      severity: "warning",
      title: "Sprache nicht deklariert",
      detail:
        "Das lang-Attribut fehlt im <html>-Tag — relevant für Screenreader und Suchmaschinen.",
    });
  }

  // --- SEO (vertieft) ---
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Canonical-Tag fehlt",
      detail:
        'Ohne <link rel="canonical"> kann Google ähnliche URLs als doppelten Inhalt werten (Duplicate Content) — das schwächt Ihr Ranking.',
    });
  }
  if (!/application\/ld\+json|itemtype=["']https?:\/\/schema\.org/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Keine strukturierten Daten (schema.org)",
      detail:
        "Strukturierte Daten helfen Google, Ihr Angebot zu verstehen, und schalten Rich-Snippets (Sterne, Öffnungszeiten, Preise) in den Suchergebnissen frei — mehr Klicks bei gleichem Ranking.",
    });
  }
  const h1Count = (lower.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count > 1) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: `Mehrere H1-Überschriften (${h1Count})`,
      detail:
        "Pro Seite sollte es genau eine H1 geben. Mehrere H1 verwässern für Suchmaschinen das Hauptthema der Seite.",
    });
  }

  // --- Sicherheit (vertieft) ---
  if (res.url.startsWith("https:") && /\ssrc=["']http:\/\//i.test(html)) {
    findings.push({
      category: "Sicherheit",
      severity: "warning",
      title: "Unsichere Inhalte (Mixed Content)",
      detail:
        "Die HTTPS-Seite lädt Ressourcen über unverschlüsseltes HTTP. Browser blockieren diese teils oder warnen — das untergräbt das Schloss-Symbol und das Vertrauen.",
    });
  }
  const generator = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";
  if (generator && /\d/.test(generator)) {
    findings.push({
      category: "Sicherheit",
      severity: "warning",
      title: "Software-Version sichtbar",
      detail: `Die Seite gibt ihre Software preis: „${generator.slice(0, 60)}". Das erleichtert Angreifern, gezielt bekannte Schwachstellen veralteter Versionen auszunutzen.`,
    });
  }

  // --- Conversion ---
  const ctaPattern =
    /(jetzt|kostenlos|anfrage|anfragen|angebot|termin|buchen|demo|beratung|starten|loslegen|kaufen|bestellen|mehr erfahren|get started|contact|book|buy now|sign up)/i;
  const clickables = html.match(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi) ?? [];
  const hasCta =
    clickables.some((b) => ctaPattern.test(b.replace(/<[^>]+>/g, " "))) ||
    /class=["'][^"']*\b(btn|button|cta)\b/i.test(html);
  if (!hasCta) {
    findings.push({
      category: "Conversion",
      severity: "warning",
      title: "Kein klarer Call-to-Action erkennbar",
      detail:
        'Es ist kein eindeutiger Handlungsaufruf zu finden (z. B. „Jetzt anfragen", „Termin buchen"). Besucher wissen nicht, was sie als Nächstes tun sollen — einer der häufigsten Conversion-Killer.',
    });
  }
  const hasPhone =
    /href=["']tel:/i.test(html) || /(\+\d{2,3}[\s/-]?\d|\(0\d{2,4}\)|\b0\d{2,4}[\s/-]\d{3,})/.test(html);
  const hasContact = /<form\b/i.test(html) || /href=["']mailto:/i.test(html) || /(kontakt|contact)/i.test(lower);
  if (!hasContact && !hasPhone) {
    findings.push({
      category: "Conversion",
      severity: "critical",
      title: "Keine einfache Kontaktmöglichkeit gefunden",
      detail:
        "Weder Kontaktformular, E-Mail noch Telefonnummer sind klar erkennbar. Interessenten, die anfragen möchten, springen ab — direkt verlorener Umsatz.",
    });
  } else if (!hasPhone) {
    findings.push({
      category: "Conversion",
      severity: "warning",
      title: "Keine klickbare Telefonnummer",
      detail:
        "Eine sichtbare Telefonnummer als tel:-Link senkt die Hemmschwelle und gewinnt spontane Anfragen — besonders auf dem Smartphone.",
    });
  }
  const hasTrust =
    /(bewertung|kundenstimm|testimonial|rezension|garantie|zertifik|ausgezeichnet|trusted|referenz|dsgvo|datenschutz|ssl[- ]?verschl|verschlüsselt|server in der eu|geprüft|trustpilot|google bewertung)/i.test(
      lower,
    ) || /aggregaterating|"review"/i.test(html);
  if (!hasTrust) {
    findings.push({
      category: "Conversion",
      severity: "warning",
      title: "Wenig Vertrauenselemente",
      detail:
        "Bewertungen, Referenzen, Garantien oder Zertifikate sind nicht sichtbar. Solche Trust-Signale steigern die Conversion-Rate messbar.",
    });
  }

  // --- Score ---
  const penalty = findings.reduce((acc, f) => {
    if (f.severity === "critical") return acc + 18;
    if (f.severity === "warning") return acc + 8;
    return acc;
  }, 0);
  const score = Math.max(8, Math.min(98, 100 - penalty));

  const criticals = findings.filter((f) => f.severity === "critical").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  const summary =
    criticals > 0
      ? `Unsere Analyse hat ${criticals} kritische ${criticals === 1 ? "Schwachstelle" : "Schwachstellen"} und ${warnings} ${warnings === 1 ? "Verbesserungspotenzial" : "Verbesserungspotenziale"} gefunden. Diese Probleme kosten Sie aktuell Besucher, Rankings und Umsatz — sind aber gut behebbar.`
      : warnings > 0
        ? `Solide Basis — aber ${warnings} ${warnings === 1 ? "Punkt lässt" : "Punkte lassen"} messbar Potenzial liegen. Mit gezielter Optimierung holen Sie deutlich mehr aus Ihrer Website heraus.`
        : "Stark! Ihre Website ist technisch gut aufgestellt. Für das letzte Quäntchen Performance und Conversion beraten wir Sie gern persönlich.";

  return { url: res.url || url.href, score, loadTimeMs, htmlSizeKb, findings, summary };
}
