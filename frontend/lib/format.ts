import type { Locale } from "./i18n/config";

const formatters: Record<Locale, Intl.NumberFormat> = {
  de: new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }),
  en: new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }),
};

export function formatPrice(cents: number, locale: Locale = "de") {
  return formatters[locale].format(cents / 100);
}
