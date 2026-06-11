"use client";

import { useDevice, type Device } from "../lib/device-store";

// First-visit bottom sheet: "Wie nutzt du die Seite?" → phone / tablet / desktop.
// The detected option is highlighted. Stored once; never shown again.

const OPTIONS: { id: Device; label: string; icon: string; hint: string }[] = [
  { id: "phone", label: "Handy", icon: "📱", hint: "Kompakt & touch-optimiert" },
  { id: "tablet", label: "Tablet", icon: "▣", hint: "Mittelgroß, touch" },
  { id: "desktop", label: "Computer", icon: "🖥️", hint: "Volle Ansicht" },
];

export function DeviceChooser() {
  const { device, chosen, choose } = useDevice();
  if (chosen || device === null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">Wie nutzt du die Seite?</h2>
        <p className="mt-1 text-sm text-neutral-500">
          So passen wir die Darstellung optimal an. (Jederzeit änderbar.)
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => {
            const detected = o.id === device;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(o.id)}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  detected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <div className="text-2xl">{o.icon}</div>
                <div className="mt-1 text-sm font-medium">{o.label}</div>
                <div className="mt-0.5 text-[10px] opacity-70">{o.hint}</div>
                {detected && <div className="mt-1 text-[9px] uppercase tracking-wide">erkannt</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
