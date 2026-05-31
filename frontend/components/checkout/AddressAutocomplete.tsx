"use client";

import { useEffect, useRef, useState } from "react";

export type AddressPick = {
  street: string;
  zip: string;
  city: string;
  country: string;
};

type Suggestion = AddressPick & { label: string; de: boolean };

type PhotonProps = {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  country?: string;
  countrycode?: string;
};

/**
 * Street input with free address autocomplete via the Photon API
 * (photon.komoot.io, OpenStreetMap-based, no API key). Selecting a suggestion
 * fills street, postcode, city and country in one go.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onPick,
  inputCls,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (a: AddressPick) => void;
  inputCls: string;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function fetchSuggestions(q: string) {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        // Fetch a wider set ordered by relevance, then float German results to
        // the top (keeping relevance order within each group). For a German
        // shop this surfaces e.g. Berlin before Bern, without hiding abroad.
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=de&limit=12`,
        );
        const data = (await res.json()) as { features?: { properties?: PhotonProps }[] };
        const seen = new Set<string>();
        const mapped: Suggestion[] = (data.features ?? [])
          .map((f) => {
            const p = f.properties ?? {};
            const base = p.street || p.name || "";
            const hn = p.housenumber ? ` ${p.housenumber}` : "";
            const street = `${base}${hn}`.trim();
            const city = p.city || p.town || p.village || p.municipality || p.county || "";
            const zip = p.postcode || "";
            const country = p.country || "";
            return {
              street,
              zip,
              city,
              country,
              de: (p.countrycode || "").toUpperCase() === "DE",
              label: [street, [zip, city].filter(Boolean).join(" "), country]
                .filter(Boolean)
                .join(", "),
            };
          })
          .filter((s) => s.city || s.zip)
          .filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)));
        // Stable sort → German first, relevance order preserved within groups.
        mapped.sort((a, b) => (a.de === b.de ? 0 : a.de ? -1 : 1));
        const top = mapped.slice(0, 6);
        setItems(top);
        setOpen(top.length > 0);
        setActive(-1);
      } catch {
        setItems([]);
        setOpen(false);
      }
    }, 250);
  }

  function choose(s: Suggestion) {
    onChange(s.street);
    onPick({ street: s.street, zip: s.zip, city: s.city, country: s.country });
    setOpen(false);
    setItems([]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        required
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        className={inputCls}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {items.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  i === active ? "bg-muted-bg text-foreground" : "text-muted"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
