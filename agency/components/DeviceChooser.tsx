"use client";

import { AnimatePresence, motion } from "motion/react";
import { Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { useDevice, type Device } from "@/lib/device-store";
import { useI18n } from "@/lib/i18n";

// First visit (any page): a bottom-sheet asks which device the visitor is on
// (Handy / Tablet / Laptop / PC). The detected option is marked "erkannt".
// Choosing — or skipping (= accept the detected one) — stores the choice once;
// phones & tablets switch into app mode (bottom tab bar) automatically.

export default function DeviceChooser() {
  const { t } = useI18n();
  const { device, chosen, choose } = useDevice();

  const options: { id: Device; label: string; icon: typeof Smartphone; hint: string }[] = [
    { id: "phone", label: t.device.phone, icon: Smartphone, hint: t.device.phoneHint },
    { id: "tablet", label: t.device.tablet, icon: Tablet, hint: t.device.tabletHint },
    { id: "laptop", label: t.device.laptop, icon: Laptop, hint: t.device.laptopHint },
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
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t.device.title}
          onClick={() => choose(device)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: [0.21, 0.65, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl border border-edge bg-surface p-6 shadow-2xl"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-edge" aria-hidden />
            <h2 className="text-center font-display text-xl font-bold text-ink">{t.device.title}</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-center text-sm text-ink-soft">
              {t.device.subtitle}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {options.map(({ id, label, icon: Icon, hint }) => {
                const detected = id === device;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose(id)}
                    className={`relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
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
                      <span className="mt-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                        {t.device.detected}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => choose(device)}
              className="mx-auto mt-5 block text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {t.device.skip}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
