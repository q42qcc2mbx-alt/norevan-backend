import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-accent to-cyan-glow" />
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-ink md:text-[2.75rem] md:leading-[1.15]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
