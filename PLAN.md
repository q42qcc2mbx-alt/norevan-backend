# Norevan — Plan: Website schöner & besser machen

> Ziel: Die bestehende Site (warmes Ivory/Charcoal, Cormorant + Geist, sparsames
> Gold, 2px-Radius-Signatur) auf ein „Kult-Marken"-Niveau heben — **ohne** den
> ruhigen Luxus-Look zu zerstören. Jede Idee baut auf dem aktuellen Stack auf:
> Next.js 16 · React 19 · Tailwind v4 · Motion · Lenis · Three.js · Supabase ·
> Zustand · @use-gesture.
>
> Legende: **Impact** (wie viel schöner/besser) · **Aufwand** (S/M/L) ·
> Status: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig.

---

## 0. Design-Prinzipien (Leitplanken für ALLE Ideen)

1. **Ruhe vor Effekt.** Animationen sind langsam (0.4–0.8s), `ease [0.2,0.8,0.2,1]`,
   und immer optional (`prefers-reduced-motion` respektieren).
2. **Gold nur fürs Logo / seltene Akzente** — nie als UI-Farbe (steht so in
   `globals.css`). Das bewahrt den Premium-Eindruck.
3. **Material statt Bunt.** Tiefe entsteht durch Schatten, Grain, Kontrast und
   Typografie — nicht durch Farbe.
4. **Mobile-First & 60fps.** Nur `transform`/`opacity` animieren, kein Layout-Thrash.
5. **Konsistenz.** Eyebrow (0.35em tracking), 2px-Radius, 4pt-Spacing-Scale
   überall durchziehen.

---

## 1. Quick Wins (Impact hoch · Aufwand S) — zuerst machen

- [ ] **Film-Grain-Overlay** site-weit: ein fixes, sehr subtiles Noise-PNG/SVG
      (`opacity: 0.03`, `mix-blend-mode: overlay`) macht flache Flächen „teuer".
      → neue Komponente `components/layout/GrainOverlay.tsx`, in `app/[lang]/layout.tsx`.
- [ ] **View-Transitions** zwischen Produktkarte → Produktdetail (das Bild
      „morpht" weiter). Next 16 unterstützt View Transitions; `view-transition-name`
      auf das `Image` in `ProductCard.tsx` und `ProductGallery.tsx` legen.
- [ ] **Edlere Fokus-Stile**: `:focus-visible` mit feinem `--ring`-Outline +
      `outline-offset`, statt Browser-Default. Einmal in `globals.css`.
- [ ] **Custom Selection-Farbe** (`::selection`) in Charcoal/Ivory — kleines
      Detail, das Marken-Sorgfalt signalisiert.
- [ ] **Skeleton-Shimmer** statt leerer Flächen in `app/[lang]/loading.tsx` und
      Produktgrid — ein Tailwind-Shimmer-Gradient.
- [ ] **Preis-/Zahlen-Typo**: Preise in `font-mono` mit `tabular-nums` →
      saubere Ausrichtung in Cart, Checkout, ProductCard.
- [ ] **Hover-Zustand der ProductCard verfeinern**: zweites Bild ist schon da —
      zusätzlich ein zarter Bildunterrand-Schatten + Brand-Eyebrow einblenden.

---

## 2. „The Digital Fabric" — Stoff fühlbar machen (Fokus-Bereich 1)

**Feature-Codename: `FABRIC_TILT`**

- 🎭 **Pitch:** Norevan zeigt nicht Fotos, sondern *Material*. Wenn beim Kippen
  des Phones ein Glanzlicht über die Fleece-Struktur wandert, wird das Produkt
  begehrenswert und screenshot-bar.
- 🧠 **Psychologie:** Mikrobewegung = *Tilt + langsamer Scroll*. Bewegtes
  Specular-Highlight liest das Gehirn als echte Oberfläche → taktile Erwartung.
  Subtil halten (max. 6–8°), sonst kippt „edel" in „Gimmick".
- ⚙️ **Architektur:**
  - Zwei Layer pro Produkt: `base.webp` + transparentes `spec.webp` (nur Glanz),
    via `next/image`.
  - Glanz-Layer per `mix-blend-mode: screen`, Position über CSS-Var `--tilt`.
  - Tilt via `DeviceOrientationEvent` (iOS Permission-Tap → Fallback Scroll-Parallax).
    Schreibt **nur** in eine CSS-Custom-Property → kein React-Re-Render.
  - Tailwind: `[perspective:1000px]`, `will-change-transform`,
    `[transform:translate3d(var(--tilt),0,0)]`.

**Weitere Fabric-Ideen:**
- [ ] **Stoff-Detail-Zoom** im `ProductGallery`: Pinch/Hover zeigt Makro-Crop der
      Textur (eigenes hochauflösendes Detailbild pro Produkt).
- [ ] **Materthat-Badges**: kleine Eyebrow-Chips „440 GSM · Heavy Fleece",
      „Organic Cotton" am Produkt — Qualität wird *lesbar*.
- [ ] **Farb-/Stoff-Swatches** als echte Mini-Texturen statt Farbkreisen.
- [ ] **Gewichts-Andeutung beim Scroll**: schwere Hoodies kommen langsamer/mit
      mehr „Trägheit" ins Bild (Parallax-Faktor pro Produkttyp) — nutzt das
      vorhandene `ParallaxSection` + Lenis.

---

## 3. „The Phantom Checkout" — fast unsichtbarer Kauf (Fokus-Bereich 2)

**Feature-Codename: `PHANTOM_TAP`**

- 🎭 **Pitch:** Reibung tötet Drops. Ein Kauf, der sich „verboten leicht"
  anfühlt, steigert Impuls-Conversion bei limitierten Stücken massiv.
- 🧠 **Psychologie:** Mikrobewegung = *Long-Press (~600ms) auf „Sichern"* mit
  haptischem Tick (`navigator.vibrate`) + sich füllendem Ring. Das Halten ist
  ein Mikro-Commitment **und** schützt vor Fehlkäufen — kein Dialog nötig.
- ⚙️ **Architektur:**
  - `useOptimistic` (React 19): „Bestellt ✓" erscheint, sobald der Ring voll ist;
    Server-Action läuft im Hintergrund, Rollback nur bei Fehler.
  - Stripe ist bereits integriert (`app/api/checkout/route.ts`). Für eingeloggte
    User: gespeicherte Adresse/Stripe-`customer_id` aus Supabase `profiles`
    → ein `PaymentIntent` ohne Formular. Gast = Bottom-Sheet statt Seitenwechsel.
  - Supabase **Realtime** auf eigener `orders`-Row (RLS `user_id = auth.uid()`)
    pusht `paid` → grüner Haken vom Server, kein Spinner.
  - Tailwind: Bottom-Sheet `fixed inset-x-0 bottom-0 translate-y-full
    data-[open]:translate-y-0 transition-transform duration-300`; Ring per
    `conic-gradient` + `--p`-Var.

**Weitere Checkout-/Flow-Ideen:**
- [ ] **Cart-Drawer statt Cart-Seite** als Default (ist mit `CartDrawer.tsx`
      teilweise da) — Kauf ohne Kontextverlust.
- [ ] **„Express"-Button** (Apple Pay / Google Pay über Stripe) ganz oben im Sheet.
- [ ] **Adress-Autocomplete** ist schon drin — zusätzlich Felder per Animation
      gestaffelt einblenden (Reveal), wirkt geführt statt überladen.
- [ ] **Order-Confirmation als „Ticket"**: Bestätigungsseite im Boarding-Pass-Stil
      mit Perforations-Trennlinie (CSS), Bestellnummer in Mono.

---

## 4. „The Swipe-Discovery" — Entdecken wie eine Social-App (Fokus-Bereich 3)

**Feature-Codename: `DROP_DECK`**

- 🎭 **Pitch:** Ein Karten-Stack, bei dem jede Karte kaufbar ist. „Through the
  collection" wird zum Spiel — perfekt für Lookbooks & neue Drops.
- 🧠 **Psychologie:** *Gummiartiger Swipe* (Karte folgt dem Finger, federt zurück),
  variable Belohnung (nächstes Stück unbekannt) → Dopamin-Schleife. **Swipe-up =
  Buy** koppelt die entschlossenste Geste an die Kaufabsicht.
- ⚙️ **Architektur:**
  - Nur 3 Karten im DOM (current / next / prefetch) → konstante Speicherlast.
  - Gesten mit dem schon installierten `@use-gesture/react`; nur
    `transform/opacity`. Tailwind: `touch-none select-none active:scale-[0.98]`,
    Rotation `rotate-[calc(var(--x)*0.05deg)]`.
  - Supabase: `discovery_feed`-View, **Keyset-Pagination** (Cursor, kein offset).
    „Want"-Swipe → `wishlist`-Tabelle (nutzt vorhandenen `wishlist-store.ts`).
  - Bilder der +1-Karte via `next/image priority` vorladen → null Ladezeit.
  - Swipe-up übergibt direkt an `PHANTOM_TAP`.

**Weitere Discovery-/Navigations-Ideen:**
- [ ] **Sticky „Mini-Filter"** im Shop (`CategoryFilter.tsx`) als horizontaler
      Chip-Rail, der beim Scroll andockt.
- [ ] **Lookbook als Vollbild-Story** (`app/[lang]/lookbook/page.tsx`):
      Snap-Scroll-Sektionen, jedes Bild mit „Shop the look"-Hotspots.
- [ ] **Suchoverlay aufwerten** (`SearchOverlay.tsx`): Recent/Trending,
      Tastatur-Navigation, Live-Ergebnisse mit Bild-Thumbs.

---

## 5. Homepage / Hero & Storytelling (Impact hoch)

- [ ] **Hero mit Tiefe**: bestehende Three/Metaball-Komponenten gezielt einsetzen
      oder durch ein ruhiges, hochwertiges Editorial-Bild + animierte Headline
      (Cormorant, Wort-für-Wort-Reveal) ersetzen.
- [ ] **Marquee verfeinern** (`AnnouncementMarquee.tsx`): pausiert on-hover,
      feine Trenn-Glyphe (·) zwischen Claims.
- [ ] **„Brand Story"-Sektion**: Parallax-Bild + Text, der die Marke erzählt
      (nutzt `ParallaxSection` + `Reveal`).
- [ ] **Editorial-Grid** statt nur Produktraster: asymmetrisches Bento-Layout für
      Kategorien („New", „Heavyweight", „Accessories").
- [ ] **Newsletter-Sektion** (`NewsletterSection.tsx`) als ruhiger Full-Bleed-Block
      mit Erfolgs-Mikroanimation nach Eintrag.

---

## 6. Mikro-Interaktionen & Motion-Politur (Impact mittel · Aufwand S–M)

- [ ] **MagneticButton** (schon da) konsequent für primäre CTAs einsetzen.
- [ ] **ScrollProgress** (schon da) als haarfeine Top-Linie in Akzentfarbe.
- [ ] **Add-to-Cart-Flug**: Produktbild fliegt animiert in den Cart-Icon-Badge.
- [ ] **Wishlist-Herz**: weicher „Pop" + Haptik beim Toggle.
- [ ] **Page-Transitions** (`PageTransition.tsx`) global: sanftes Fade/Slide.
- [ ] **Zahlen-Count-Up** für Preise/Counts beim Erscheinen.
- [ ] **Cursor-Companion** (Desktop): dezenter Punkt, der bei interaktiven
      Elementen wächst — nur wenn `pointer: fine`.

---

## 7. Typografie & Layout-Feinschliff (Impact mittel · Aufwand S)

- [ ] **Headline-Skala** mit `clamp()` durchgängig fluid machen.
- [ ] **Eyebrow überall** als wiederkehrendes Marken-Element (Sektions-Köpfe).
- [ ] **Italic-Cormorant** für einzelne Highlight-Wörter in Headlines (`<em>`).
- [ ] **Großzügigeres Whitespace** im Mobile-Layout (8pt-Rhythmus prüfen).
- [ ] **Optische Bild-Ränder**: einheitlicher 2px-Radius + 1px Border-Subtle
      auf allen Produktbildern.

---

## 8. Dark/Light & Atmosphäre (Impact mittel)

- [ ] **ThemeToggle** mit weicher Crossfade-Transition statt hartem Umschalten.
- [ ] **Theme-abhängige Hero-Stimmung**: dunkel = nächtlich/edel, hell = champagner.
- [ ] **Adaptive Bild-Behandlung**: leichter Vignette/Grain-Layer je nach Theme.

---

## 9. Performance & Polish (macht „schön" erst spürbar)

- [ ] **next/image überall** mit korrekten `sizes` + `placeholder="blur"`.
- [ ] **Three.js-Komponenten lazy** (sind es teilweise: `*Lazy.tsx`) — nur laden,
      wenn sichtbar/Idle; auf Mobile evtl. statisches Fallback.
- [ ] **Font-Display swap** + Preload der zwei Schriften.
- [ ] **`prefers-reduced-motion`**: zentrale Hook/Guard, die alle Motion-Effekte
      respektieren.
- [ ] **Lighthouse-Pass** (Mobile) als Gate vor jedem größeren Merge.

---

## 10. Vertrauen & Conversion-Details (schön + verkaufsstark)

- [ ] **Trust-Strip** (`BrandStrip.tsx`): Versand, Rückgabe, sichere Zahlung als
      feine Icon-Reihe.
- [ ] **Größen-Guide** als elegantes Modal (Tabelle in Mono).
- [ ] **„Low stock / Last pieces"**-Hinweis dezent über Supabase-Bestand.
- [ ] **Produkt-Bewertungen** (später) — minimalistische Sterne, kein Clutter.

---

## Phasen-Roadmap (Vorschlag)

| Phase | Inhalt | Ziel |
|-------|--------|------|
| **P1 — Politur** | Abschnitt 1 (Quick Wins) + 6 + 7 | Sofort sichtbar edler, geringes Risiko |
| **P2 — Fabric** | `FABRIC_TILT` + Stoff-Details (Abschn. 2) | Produkt fühlbar machen |
| **P3 — Flow** | `PHANTOM_TAP` + Cart/Checkout (Abschn. 3) | Reibungsloser, mehr Conversion |
| **P4 — Discovery** | `DROP_DECK` + Lookbook/Suche (Abschn. 4, 5) | Entdecken als Erlebnis |
| **P5 — Atmosphäre** | Abschn. 8 + 9 + 10 | Stimmung, Speed, Vertrauen |

---

## Nächster Schritt

Sag mir, **welche Phase oder welche einzelne Idee** ich zuerst umsetzen soll —
ich empfehle die **Quick Wins (Abschnitt 1)** als Start, weil sie sofort sichtbar
sind, kaum Risiko haben und den Premium-Look schärfen. Dann baue ich sie auf
`claude/wo-sind-wir-PnKV9` und zeige dir das Ergebnis.

---

# Teil II — Noch mehr Ideen (Erweiterung)

> Größer, eigenständiger, „Kult-Marke". Weiter nach Themen sortiert. Gleiche
> Leitplanken wie oben (Ruhe, sparsames Gold, Material, 60fps, Reduced-Motion).

## 11. Personalisierung & Wiedererkennung

- [ ] **„Welcome back, {Name}"** dezent im Header für eingeloggte User (Supabase
      `profiles`) — kein Popup, nur ein feiner Eyebrow-Gruß.
- [ ] **Zuletzt angesehen**-Reihe (LocalStorage/Zustand) unten auf Produktseiten.
- [ ] **„Für dich"-Drop**: einfache Heuristik (gleiche Kategorie/Brand wie
      Wishlist) → personalisierte Sektion auf der Startseite.
- [ ] **Gespeicherte Größe**: einmal gewählt, überall vorausgefüllt → ein Tap
      weniger bis zum Kauf.
- [ ] **Wiederkehr-Akzent**: Theme-Wahl (dark/light) pro User merken.

## 12. Community & Social Proof (ohne Clutter)

- [ ] **„Worn by"-Galerie**: kuratierte Kund:innen-Fotos pro Produkt
      (moderiert, in Supabase Storage), als edle Masonry-Strip.
- [ ] **Live-Aktivität dezent**: „3 sichern das gerade" via Supabase Realtime —
      nur bei echten Events, nie fake.
- [ ] **Wishlist teilen**: signierter Link auf die eigene Wunschliste
      (Geschenk-Hint-Funktion).
- [ ] **Restock-Bell**: bei ausverkauften Größen E-Mail/Push abonnieren
      (Supabase Table + bestehender Mail-Flow).

## 13. Storytelling & Editorial

- [ ] **Produkt-„Origin"-Block**: kurze Story je Drop (Material, Inspiration),
      Cormorant-Italic-Headline + Foto.
- [ ] **Journal/Magazin**-Route (`/[lang]/journal`): MDX-Artikel, Lookbooks,
      Behind-the-Scenes → SEO + Markenwelt.
- [ ] **Kollektions-Landingpages** mit eigener Farb-/Bildstimmung pro Drop.
- [ ] **Manifest-Sektion**: ein starkes Marken-Statement als Full-Bleed-Typo.

## 14. Sinnliches UI (Sound, Haptik, Detail)

- [ ] **Optionaler Sound-Layer**: extrem dezente Klicks/Whooshes (toggle-bar,
      default aus) — Web Audio, < 5kb Samples.
- [ ] **Haptik-Grammatik**: einheitliche `navigator.vibrate`-Muster (Add = kurz,
      Kauf = doppelter Tick, Fehler = langes Brummen).
- [ ] **„Unboxing"-Bestätigung**: nach Kauf eine ruhige Sequenz (Siegel/Logo
      animiert), die sich wie Auspacken anfühlt.
- [ ] **Idle-Atmosphäre**: nach Inaktivität sehr langsames Atmen des Hero-Grain.

## 15. Visuelle Tiefe & 3D (vorhandenes Three.js nutzen)

- [ ] **3D-Produkt-Spin** für Hero-Stücke (`ProductSlider3D` ausbauen): Drag zum
      Drehen, auf Mobile Auto-Rotate + Tap-to-stop.
- [ ] **Tiefen-Layer im Hero**: Logo/Typo auf mehreren Z-Ebenen mit
      Maus-/Tilt-Parallax (`ExplodingInfo` weiterdenken).
- [ ] **„Material-Showcase"**: ein Three-Shader, der Stoff-Falten/Glanz andeutet
      — nur Desktop/idle, mobil statisches Fallback.

## 16. Conversion-Schönheit (verkauft *und* sieht gut aus)

- [ ] **Sticky Buy-Bar** auf Mobile-Produktseite: Preis + „Sichern" dockt unten an.
- [ ] **Größen-Verfügbarkeit visuell**: ausverkaufte Größen durchgestrichen, nicht
      versteckt → Begehrlichkeit.
- [ ] **Bundle/„Complete the look"**: zwei, drei passende Teile als ein Tap-Add.
- [ ] **Mini-Countdown** für Drops/Releases (ruhig, Mono-Ziffern, kein Blink-Stress).
- [ ] **Free-Shipping-Fortschritt** im Cart-Drawer („noch 12 € bis Gratisversand").

## 17. Onboarding & leere Zustände (oft vergessen, viel Wirkung)

- [ ] **Schöne Empty-States**: leerer Warenkorb/Wishlist mit Illustration + CTA
      statt nacktem Text.
- [ ] **First-Visit-Hint**: einmalige, wegwischbare Geste-Erklärung beim Swipe-Deck.
- [ ] **404/Error edel** (`not-found.tsx`, `error.tsx`): Marken-Typo + Rückweg.

## 18. Barrierefreiheit als Premium-Merkmal

- [ ] **Tastatur-Vollbedienung** für Drawer, Overlay, Swipe-Deck (Arrow-Keys).
- [ ] **Sichtbarer Fokus + Skip-Link**; Kontraste AA prüfen (Gold nie für Text).
- [ ] **`prefers-reduced-motion`**: zentrale Variante aller Effekte.
- [ ] **Alt-Texte & ARIA** für alle Produktbilder/Buttons systematisch.

## 19. Internationalisierung & Vertrauen

- [ ] **Währungs-/Sprach-Switcher** (i18n ist da: `[lang]`) sichtbarer & schöner.
- [ ] **Lokale Zahlungs-/Versand-Hinweise** je Region.
- [ ] **Klar gestaltete Legal-/Trust-Seiten** (`legal/`) im Marken-Layout statt
      Fließtext-Wüste.

## 20. Saisonales & „lebendige" Marke

- [ ] **Theme-Akzente nach Saison/Drop** (über CSS-Vars, ein Schalter).
- [ ] **Easter-Egg**: Konami-/Logo-Tap → kleine Animation (Markenliebe, teilbar).
- [ ] **„Coming soon"-Teaser** mit E-Mail-Capture für den nächsten Drop.

---

## Top-10-Empfehlung (wenn du schnell Wirkung willst)

1. Film-Grain-Overlay (1)
2. View-Transitions Karte→Detail (1)
3. Sticky Buy-Bar mobil (16)
4. Add-to-Cart-Flug + Haptik (6/14)
5. Schöne Empty-States (17)
6. `FABRIC_TILT` Glanzlicht (2)
7. Free-Shipping-Fortschritt im Drawer (16)
8. Editorial-/Bento-Grid Startseite (5)
9. Zuletzt angesehen (11)
10. ThemeToggle-Crossfade (8)

Sag „mach Top 3" oder nenn Nummern — ich setze sie um.
