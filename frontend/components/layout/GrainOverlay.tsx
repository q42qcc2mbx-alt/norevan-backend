/**
 * GrainOverlay — site-wide film grain.
 * A fixed, non-interactive SVG-noise layer at very low opacity. It adds a
 * subtle "analog" texture that makes flat brand surfaces feel more premium.
 * Pure CSS/SVG, no JS, no animation → zero runtime cost and reduced-motion safe.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
         <feColorMatrix type='saturate' values='0'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`,
  );

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-overlay dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: "160px 160px",
      }}
    />
  );
}
