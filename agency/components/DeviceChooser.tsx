"use client";

import { AnimatePresence, motion } from "motion/react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useDevice, type Device } from "@/lib/device-store";
import { useI18n } from "@/lib/i18n";

// First visit: device choice (phone / tablet / desktop). Detected option is
// highlighted; the choice is stored once.

export default function DeviceChooser() {
  const { t } = useI18n();
  const { device, chosen, choose } = useDevice();

  const options: { id: Device; label: string; icon: typeof Smartphone; hint: string }[] = [
    { id: "phone", label: t.device.phone, icon: Smartphone, hint: t.device.phoneHint },
    { id: "tablet", label: t.device.tablet, icon: Tablet, hint: t.device.tabletHint },
    { id: "desktop", label: t.device.desktop, icon: Monitor, hint: t.device.desktopHint },
  ];

  return (
    <AnimatePresence>
      {!chosen && device !== null && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[60] p-4"
          role="dialog"
          aria-label={t.device.title}
        >
          <div className="card-elevated mx-auto max-w-md p-5 shadow-2xl">
            <h2 className="text-base font-bold text-ink">{t.device.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t.device.subtitle}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {options.map(({ id, label, icon: Icon, hint }) => {
                const detected = id === device;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose(id)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      detected
                        ? "border-accent bg-accent text-white shadow-md shadow-accent/30"
                        : "border-edge bg-card text-ink hover:border-accent/40"
                    }`}
                  >
                    <Icon className="mx-auto h-6 w-6" />
                    <div className="mt-1.5 text-sm font-semibold">{label}</div>
                    <div className={`mt-0.5 text-[10px] ${detected ? "text-white/80" : "text-ink-muted"}`}>
                      {hint}
                    </div>
                    {detected && (
                      <div className="mt-1 text-[9px] font-bold tracking-widest uppercase">
                        {t.device.detected}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
