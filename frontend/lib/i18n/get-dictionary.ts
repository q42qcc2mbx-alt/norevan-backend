import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/de";

const loaders = {
  de: () => import("./dictionaries/de").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  loaders[locale]();
