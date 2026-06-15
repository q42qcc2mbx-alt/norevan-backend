"use client";

import { TrendingUp } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";
import Aurora from "./ui/Aurora";
import { useI18n } from "@/lib/i18n";

const visuals = [
  { gradient: "from-blue-500 to-indigo-600", accent: "bg-blue-200/70", tech: ["Next.js", "TypeScript", "Tailwind CSS"] },
  { gradient: "from-cyan-500 to-teal-500", accent: "bg-cyan-200/70", tech: ["Shopify", "Performance", "Core Web Vitals"] },
  { gradient: "from-slate-600 to-slate-800", accent: "bg-slate-300/70", tech: ["Next.js", "Security", "SEO"] },
];

/** Stylised page preview built with CSS — fast, sharp on every screen. */
function ProjectPreview({ gradient, accent }: { gradient: string; accent: string }) {
  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden rounded-t-[calc(1.25rem-1px)] bg-gradient-to-br ${gradient}`}
      aria-hidden
    >
      <div className="absolute inset-x-6 top-6 bottom-0 rounded-t-xl bg-white/95 p-4 shadow-2xl transition-transform duration-500 group-hover:-translate-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
        <div className="mt-3 space-y-2">
          <div className={`h-3 w-2/3 rounded ${accent}`} />
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-5/6 rounded bg-slate-200" />
          <div className="mt-3 flex gap-2">
            <div className={`h-6 w-20 rounded-full ${accent}`} />
            <div className="h-6 w-20 rounded-full bg-slate-200" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-10 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
            <div className="h-10 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
            <div className="h-10 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { t } = useI18n();
  return (
    <section id="portfolio" className="relative overflow-hidden py-12 md:py-24">
      <Aurora />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={t.portfolio.eyebrow}
          title={t.portfolio.title}
          subtitle={t.portfolio.subtitle}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {t.portfolio.items.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.08}>
              <article className="card group flex h-full flex-col overflow-hidden p-0">
                <ProjectPreview gradient={visuals[i].gradient} accent={visuals[i].accent} />
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                    {project.category}
                  </span>
                  <h3 className="mt-1.5 text-lg font-semibold text-ink">{project.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visuals[i].tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-soft ring-1 ring-edge"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-2 border-t border-edge pt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    {project.result}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
