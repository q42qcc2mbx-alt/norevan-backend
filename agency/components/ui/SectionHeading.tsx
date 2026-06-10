import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
      <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-accent-soft uppercase">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-slate-400 md:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
