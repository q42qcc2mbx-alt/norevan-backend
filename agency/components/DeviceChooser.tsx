"use client";

import { AnimatePresence, motion } from "motion/react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useDevice, type Device } from "@/lib/device-store";
import { useI18n } from "@/lib/i18n";

// First visit on ANY page (incl. the homepage): the visitor picks their device
// (phone / tablet / desktop). The detected option is highlighted; the choice is
// stored once and exposed as data-device on <html> for device-specific styling.

export default function DeviceChooser() {
  const { t } = useI18n();
  const { device, chosen, choose } = useDevice();

  // Picking "Handy" also switches straight into the app-like fullscreen view
  // (the click is a user gesture, so the browser allows it). Android does this
  // instantly; iOS Safari has no fullscreen API, so it just stores the choice.
  function enterAppMode() {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    try {
      req?.()?.catch?.(() => {});
    } catch {
      /* ignore */
    }
  }

  function handleChoose(d: Device) {
    choose(d);
    if (d === "phone") enterAppMode();
  }

  const options: { id: Device; label: string; icon: typeof Smartphone; hint: string }[] = [
    { id: "phone", label: t.device.phone, icon: Smartphone, hint: t.device.phoneHint },
    { id: "tablet", label: t.device.tablet, icon: Tablet, hint: t.device.tabletHint },
    { id: "desktop", label: t.device.desktop, icon: Monitor, hint: t.device.desktopHint },
  ];

  return (
    <AnimatePresence>
      {!chosen && device !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-page/80 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t.device.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.21, 0.65, 0.36, 1] }}
            className="card-elevated w-full max-w-md p-6 text-center shadow-2xl sm:p-7"
          >
            <h2 className="font-display text-xl font-bold text-ink md:text-2xl">{t.device.title}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{t.device.subtitle}</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {options.map(({ id, label, icon: Icon, hint }) => {
                const detected = id === device;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleChoose(id)}
                    className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                      detected
                        ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                        : "border-edge bg-card text-ink hover:-translate-y-0.5 hover:border-accent/50"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                    <div className="mt-2 text-sm font-semibold">{label}</div>
                    <div className={`mt-0.5 text-[10px] ${detected ? "text-white/80" : "text-ink-muted"}`}>
                      {hint}
                    </div>
                    {detected && (
                      <div className="mt-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                        {t.device.detected}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
