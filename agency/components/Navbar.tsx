"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Globe, Menu, ScanSearch, UserRound, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./ui/Logo";
import { useI18n } from "@/lib/i18n";
import { LANGS, type Lang } from "@/lib/translations";
import { getSupabase } from "@/lib/supabase";

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Sprache wählen / Choose language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-edge bg-surface px-3 text-xs font-semibold text-ink-soft uppercase transition-all hover:border-accent/40 hover:text-ink"
      >
        <Globe className="h-4 w-4" />
        {lang}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-36 overflow-hidden rounded-xl border border-edge bg-surface shadow-xl ${
              compact ? "start-0" : "end-0"
            }`}
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l.code as Lang);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-start text-sm font-medium transition-colors ${
                    lang === l.code ? "bg-accent/10 text-accent" : "text-ink-soft hover:bg-card hover:text-ink"
                  }`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  // The menu is "open for" a specific path — navigating closes it implicitly.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (next: boolean) => setOpenPath(next ? pathname : null);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/loesungen", label: t.nav.solutions },
    { href: "/leistungen", label: t.nav.services },
    { href: "/analyse", label: t.nav.analyse },
    { href: "/portfolio", label: t.nav.portfolio },
    { href: "/ueber-uns", label: t.nav.about },
    { href: "/kontakt", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setLoggedIn(Boolean(session)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-edge bg-page/85 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:h-[4.5rem] md:px-8">
        <Link href="/" aria-label="NOREVAN Digital — Startseite" className="shrink-0">
          <Logo size={36} wordmarkClass="text-lg" />
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-accent" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2.5 xl:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={loggedIn ? "/dashboard" : "/login"}
            className="btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <UserRound className="h-4 w-4" />
            {loggedIn ? t.nav.myArea : t.nav.login}
          </Link>
          <Link
            href="/analyse"
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <ScanSearch className="h-4 w-4" />
            {t.nav.freeAnalysis}
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-ink transition-colors hover:bg-card"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[calc(100dvh-4rem)] overflow-x-hidden overflow-y-auto border-b border-edge bg-page/95 backdrop-blur-xl xl:hidden"
          >
            <div className="space-y-1 px-5 pt-2 pb-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-accent/10 text-accent"
                        : "text-ink-soft hover:bg-card hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="space-y-2.5 pt-3">
                <Link
                  href="/analyse"
                  className="btn-primary block rounded-full px-5 py-3.5 text-center text-base font-semibold"
                >
                  {t.nav.freeAnalysis}
                </Link>
                <Link
                  href={loggedIn ? "/dashboard" : "/login"}
                  className="btn-secondary block rounded-full px-5 py-3.5 text-center text-base font-semibold"
                >
                  {loggedIn ? t.nav.myArea : t.nav.loginAccount}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
