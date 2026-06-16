"use client";

// Decorative, slowly-drifting gradient "aurora" blobs for hero sections.
// Self-clipping (own overflow-hidden) so it never causes horizontal overflow,
// regardless of the parent. Reduced-motion is handled globally in globals.css.
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute -top-24 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div
        className="animate-float-slow absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-cyan-glow/20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-float-slow absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-[#7a1111]/25 blur-3xl"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}
