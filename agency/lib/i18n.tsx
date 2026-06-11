"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Dict, type Lang, LANGS } from "./translations";

const KEY = "norevan_lang";

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nValue>({
  lang: "de",
  setLang: () => {},
  t: translations.de,
  dir: "ltr",
});

function applyToDocument(lang: Lang) {
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  // Restore the stored language after hydration (SSR always renders German).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(KEY) as Lang | null;
        if (stored && stored in translations && stored !== "de") {
          applyToDocument(stored);
          setLangState(stored);
        }
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function setLang(l: Lang) {
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    applyToDocument(l);
    setLangState(l);
  }

  const dir = LANGS.find((l) => l.code === lang)?.dir ?? "ltr";
  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang], dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
