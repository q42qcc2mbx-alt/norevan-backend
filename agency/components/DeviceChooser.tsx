"use client";

import { AnimatePresence, motion } from "motion/react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useDevice, type Device } from "@/lib/device-store";

// First visit: "Wie nutzen Sie die Seite?" → Handy / Tablet / Computer.
// The detected option is highlighted; the choice is stored once.

const OPTIONS: { id: Device; label: string; icon: typeof Smartphone; hint: string }[] = [
  { id: "phone", label: "Handy", icon: Smartphone, hint: "Kompakt & touch-optimiert" },
  { id: "tablet", label: "Tablet", icon: Tablet, hint: "Mittelgroß, touch" },
  { id: "desktop", label: "Computer", icon: Monitor, hint: "Volle Ansicht" },
];

export default function DeviceChooser() {
  const { device, chosen, choose } = useDevice();

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
          aria-label="Geräteauswahl"
        >
          <div className="card-elevated mx-auto max-w-md p-5 shadow-2xl">
            <h2 className="text-base font-bold text-ink">Wie nutzen Sie die Seite?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              So passen wir die Darstellung optimal an — jederzeit änderbar.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {OPTIONS.map(({ id, label, icon: Icon, hint }) => {
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
                        erkannt
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
