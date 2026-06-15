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
const PROBE_TIMEOUT_MS = 6_000;
const UA = "Mozilla/5.0 (compatible; NorevanAudit/1.0; +https://norevan.digital)";

/** Lightweight GET for same-origin resources (robots.txt, sitemap.xml,
 *  favicon). Best-effort: returns null on any error/timeout. */
async function probe(target: string): Promise<{ status: number; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const u = new URL(target);
    assertPublicHost(u);
    const res = await fetch(u, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": UA },
    });
    const text = (await res.text().catch(() => "")).slice(0, 50_000);
    return { status: res.status, text };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Does the plain-HTTP version redirect to HTTPS? true/false, or null when
 *  inconclusive. */
async function httpRedirectsToHttps(host: string): Promise<boolean | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const u = new URL(`http://${host}/`);
    assertPublicHost(u);
    const res = await fetch(u, {
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": UA },
    });
    if (res.status >= 300 && res.status < 400) {
      return (res.headers.get("location") ?? "").toLowerCase().startsWith("https:");
    }
    if (res.status === 200) return false; // served over HTTP without redirect
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

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

const MAX_REDIRECTS = 5;

/** True if a bare numeric host (decimal/hex/octal IPv4, e.g. 2130706433,
 *  0x7f000001, 017700000001, 127.1) resolves into the private/loopback space. */
function numericHostIsPrivate(host: string): boolean {
  // IPv4-mapped IPv6 like ::ffff:127.0.0.1
  const mapped = host.replace(/^\[?::ffff:/i, "").replace(/\]$/, "");
  // Try to read the host as a single integer (covers hex/decimal/octal).
  let n: number | null = null;
  if (/^0x[0-9a-f]+$/i.test(host)) n = parseInt(host, 16);
  else if (/^0[0-7]+$/.test(host)) n = parseInt(host, 8);
  else if (/^\d{1,10}$/.test(host)) n = parseInt(host, 10);
  if (n !== null && Number.isFinite(n) && n >= 0 && n <= 0xffffffff) {
    const a = (n >>> 24) & 255;
    const b = (n >>> 8) & 255;
    return a === 127 || a === 10 || a === 0 || (a === 192 && b === 168) || (a === 169 && ((n >>> 16) & 255) === 254) || (a === 172 && b >= 16 && b <= 31);
  }
  // Shorthand dotted forms (127.1, 10.1 …) — check the leading octet.
  const lead = mapped.match(/^(\d{1,3})\./);
  if (lead) {
    const a = Number(lead[1]);
    return a === 127 || a === 10 || a === 0;
  }
  return false;
}

/** Block requests to private/internal hosts (SSRF protection). */
function assertPublicHost(url: URL) {
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const privatePatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^::ffff:/i,
    /^f[cd][0-9a-f]{2}:/i,
    /^fe80:/i,
    /\.local$/,
    /\.internal$/,
    /\.localhost$/,
  ];
  const looksLikeName = host.includes(".") && !/^[0-9.]+$/.test(host);
  if (
    (!host.includes(".") && !host.includes(":")) ||
    privatePatterns.some((p) => p.test(host)) ||
    (!looksLikeName && numericHostIsPrivate(host))
  ) {
    throw new Error("Diese Adresse kann nicht analysiert werden.");
  }
}

/** Fetch with manual redirect handling: every hop is re-validated against the
 *  SSRF allow-list so a public URL can't bounce us to an internal address. */
async function fetchSite(startUrl: URL) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = performance.now();
  try {
    let url = startUrl;
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      assertPublicHost(url);
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; NorevanAudit/1.0; +https://norevan.digital)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        if (hop === MAX_REDIRECTS) throw new Error("Zu viele Weiterleitungen.");
        const next = new URL(res.headers.get("location")!, url);
        if (next.protocol !== "http:" && next.protocol !== "https:") {
          throw new Error("Diese Adresse kann nicht analysiert werden.");
        }
        res.body?.cancel().catch(() => {});
        url = next;
        continue;
      }
      break;
    }
    const reader = res!.body?.getReader();
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
    return { res: res!, html, bytes, loadTimeMs };
  } finally {
    clearTimeout(timer);
  }
}

export async function runAudit(
  rawUrl: string,
  opts: { deep?: boolean } = {},
): Promise<AuditResult> {
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
  const hasForm = /<form\b/i.test(html);
  const hasMailto = /href=["']mailto:/i.test(html);
  // A contact form or e-mail is already a complete contact channel; only the
  // bare word "Kontakt" without any actual channel is "weak".
  const hasStrongContact = hasForm || hasMailto;
  const hasContact = hasStrongContact || /(kontakt|contact)/i.test(lower);
  if (!hasContact && !hasPhone) {
    findings.push({
      category: "Conversion",
      severity: "critical",
      title: "Keine einfache Kontaktmöglichkeit gefunden",
      detail:
        "Weder Kontaktformular, E-Mail noch Telefonnummer sind klar erkennbar. Interessenten, die anfragen möchten, springen ab — direkt verlorener Umsatz.",
    });
  } else if (hasStrongContact || hasPhone) {
    findings.push({
      category: "Conversion",
      severity: "good",
      title: "Klare Kontaktmöglichkeiten",
      detail:
        "Besucher können Sie direkt erreichen (Formular, E-Mail oder Telefon) — die Hürde zur Anfrage ist niedrig.",
    });
  } else {
    // Only the word "Kontakt" found, but no form, e-mail or phone to act on.
    findings.push({
      category: "Conversion",
      severity: "warning",
      title: "Kein direkter Kontaktweg",
      detail:
        "Es gibt keinen anklickbaren Kontaktweg (Formular, E-Mail oder Telefon). Jede zusätzliche Hürde kostet Anfragen — ein klarer Kanal gewinnt spontane Interessenten.",
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

  // --- Standards & Social (cheap, always) ---
  const ctCharset = /charset=/i.test(headers.get("content-type") ?? "");
  if (!ctCharset && !/<meta[^>]+charset/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Zeichensatz nicht deklariert",
      detail:
        "Ohne deklarierten Zeichensatz (UTF-8) kann es bei Umlauten und Sonderzeichen zu Darstellungsfehlern kommen — unprofessionell und schlecht für die Lesbarkeit.",
    });
  }
  if (!/^\s*<!doctype html>/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Kein moderner HTML5-Doctype",
      detail:
        "Ohne <!DOCTYPE html> rendern Browser im veralteten „Quirks-Modus“ — das führt zu inkonsistenter Darstellung über verschiedene Geräte hinweg.",
    });
  }
  const hasOg = /<meta[^>]+property=["']og:/i.test(html);
  if (hasOg && !/<meta[^>]+property=["']og:image/i.test(html)) {
    findings.push({
      category: "SEO",
      severity: "warning",
      title: "Kein Social-Vorschaubild (og:image)",
      detail:
        "Beim Teilen auf WhatsApp, LinkedIn oder Facebook erscheint kein Vorschaubild. Links wirken weniger vertrauenswürdig und werden deutlich seltener geklickt.",
    });
  }
  const viewportContent = html.match(/<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? "";
  if (viewportContent && !/width\s*=\s*device-width/i.test(viewportContent)) {
    findings.push({
      category: "UX",
      severity: "warning",
      title: "Viewport nicht korrekt für Mobilgeräte",
      detail:
        "Der Viewport-Tag enthält kein width=device-width. Auf dem Smartphone wird die Seite dadurch falsch skaliert und ist schwer bedienbar.",
    });
  }
  // On an HTTPS site every cookie should carry the Secure flag.
  const setCookie = headers.get("set-cookie") ?? "";
  if (res.url.startsWith("https:") && setCookie && !/;\s*secure/i.test(setCookie)) {
    findings.push({
      category: "Sicherheit",
      severity: "warning",
      title: "Cookies ohne Secure-Flag",
      detail:
        "Gesetzte Cookies tragen nicht das Secure-Flag und können so über unverschlüsselte Verbindungen abgegriffen werden — ein vermeidbares Sicherheitsrisiko.",
    });
  }

  // --- Deep checks (only on the full /analyse, not the fast funnel scan) ---
  if (opts.deep) {
    const origin = (() => {
      try {
        return new URL(res.url || url.href).origin;
      } catch {
        return url.origin;
      }
    })();
    const host = new URL(origin).host;
    const [robots, sitemap, httpsRedirect] = await Promise.all([
      probe(`${origin}/robots.txt`),
      probe(`${origin}/sitemap.xml`),
      httpRedirectsToHttps(host),
    ]);

    // robots.txt — crawlability
    if (!robots || robots.status >= 400) {
      findings.push({
        category: "SEO",
        severity: "warning",
        title: "Keine robots.txt gefunden",
        detail:
          "Ohne robots.txt steuern Sie nicht, was Suchmaschinen crawlen, und der übliche Verweis auf Ihre Sitemap fehlt — Google findet Ihre Unterseiten langsamer.",
      });
    } else {
      // Blanket block: "Disallow: /" (root) for all bots, without an Allow: /.
      const blocksAll =
        /user-agent:\s*\*/i.test(robots.text) &&
        /disallow:\s*\/\s*(\n|$)/i.test(robots.text) &&
        !/allow:\s*\/\s*(\n|$)/i.test(robots.text);
      if (blocksAll) {
        findings.push({
          category: "SEO",
          severity: "critical",
          title: "Suchmaschinen ausgesperrt (robots.txt)",
          detail:
            "Die robots.txt blockiert das Crawlen der gesamten Website (Disallow: /). Google kann die Seite nicht indexieren — sie erscheint praktisch nicht in der Suche. Das kostet Sie nahezu jeden organischen Besucher.",
        });
      }
    }

    // Sitemap — present at /sitemap.xml or referenced in robots.txt
    const sitemapInRobots = !!robots && /sitemap:/i.test(robots.text);
    const sitemapOk = (sitemap && sitemap.status < 400) || sitemapInRobots;
    if (!sitemapOk) {
      findings.push({
        category: "SEO",
        severity: "warning",
        title: "Keine Sitemap gefunden",
        detail:
          "Es ist keine XML-Sitemap auffindbar. Eine Sitemap hilft Google, alle Unterseiten vollständig und schnell zu erfassen — besonders wichtig bei mehr als nur einer Handvoll Seiten.",
      });
    }

    // HTTP → HTTPS redirect
    if (httpsRedirect === false) {
      findings.push({
        category: "Sicherheit",
        severity: "warning",
        title: "Kein erzwungenes HTTPS",
        detail:
          "Die Seite ist auch unverschlüsselt über http:// erreichbar, ohne Weiterleitung auf https://. Besucher können versehentlich auf der unsicheren Version landen — schlecht für Vertrauen und Ranking.",
      });
    }

    // Favicon — link in HTML, or a reachable /favicon.ico
    const hasIconLink = /<link[^>]+rel=["'][^"']*icon["']/i.test(html);
    if (!hasIconLink) {
      const favicon = await probe(`${origin}/favicon.ico`);
      if (!favicon || favicon.status >= 400) {
        findings.push({
          category: "UX",
          severity: "warning",
          title: "Kein Favicon",
          detail:
            "Im Browser-Tab und in Lesezeichen fehlt das Symbol Ihrer Marke. Das wirkt unfertig und schwächt den Wiedererkennungswert.",
        });
      }
    }
  }

  // --- Score ---
  const penalty = findings.reduce((acc, f) => {
    if (f.severity === "critical") return acc + 18;
    if (f.severity === "warning") return acc + 8;
    return acc;
  }, 0);
  // A genuinely clean audit (no warnings/criticals) can reach 100 — the score
  // only ever reflects checks we actually ran and passed, never a fabricated
  // number.
  const score = Math.max(8, Math.min(100, 100 - penalty));

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

export type SecurityGrade = "A" | "B" | "C" | "D";

/** Reduce the audit's security findings to an honest grade + lists. Shared by
 *  the portal live-check and the monthly security-report cron so both agree. */
export function summariseSecurity(findings: AuditFinding[]): {
  grade: SecurityGrade;
  protectedTitles: string[];
  issues: AuditFinding[];
} {
  const sec = findings.filter((f) => f.category === "Sicherheit");
  const crit = sec.filter((f) => f.severity === "critical").length;
  const warn = sec.filter((f) => f.severity === "warning").length;
  const grade: SecurityGrade =
    crit >= 2 ? "D" : crit === 1 ? "C" : warn === 0 ? "A" : warn === 1 ? "B" : "C";
  return {
    grade,
    protectedTitles: sec.filter((f) => f.severity === "good").map((f) => f.title),
    issues: sec.filter((f) => f.severity !== "good"),
  };
}
