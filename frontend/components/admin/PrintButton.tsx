"use client";

// Triggers the browser's print dialog (→ "Save as PDF"). Hidden when printing.
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden h-10 rounded-full bg-foreground px-5 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
    >
      {label}
    </button>
  );
}
