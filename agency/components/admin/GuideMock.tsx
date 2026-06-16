// Small, CSS-drawn "screenshot" mockups for the guide — crisp in print, no
// real screenshots needed. One kind per guide section (same order).

export type MockKind =
  | "dashboard"
  | "funnel"
  | "analyses"
  | "stats"
  | "chats"
  | "projects"
  | "messages"
  | "assistant"
  | "templates"
  | "security";

const bar = (w: string, c = "bg-edge") => <span className={`block h-1.5 rounded-full ${c}`} style={{ width: w }} />;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-edge bg-card">
      <div className="flex items-center gap-1 border-b border-edge bg-surface px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  );
}

export default function GuideMock({ kind }: { kind: MockKind }) {
  return (
    <div className="w-full max-w-[180px] shrink-0">
      <Frame>{render(kind)}</Frame>
    </div>
  );
}

function render(kind: MockKind) {
  switch (kind) {
    case "dashboard":
      return (
        <div className="space-y-2">
          <div className="flex gap-1">
            <span className="rounded-full bg-accent px-2 py-0.5 text-[7px] font-bold text-white">Übersicht</span>
            <span className="rounded-full bg-edge px-2 py-0.5 text-[7px] text-ink-muted">Analysen</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["bg-accent/15", "bg-cyan-glow/15", "bg-edge", "bg-edge"].map((c, i) => (
              <div key={i} className={`rounded-md ${c} p-1.5`}>
                <div className="h-2 w-5 rounded bg-ink/20" />
                {bar("70%")}
              </div>
            ))}
          </div>
        </div>
      );
    case "funnel":
      return (
        <div className="space-y-2 text-center">
          <div className="mx-auto h-2 w-16 rounded bg-ink/20" />
          <div className="flex items-center gap-1 rounded-full border border-edge bg-surface px-1.5 py-1">
            <span className="flex-1 text-left text-[7px] text-ink-muted">ihre-website.de</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[7px] font-bold text-white">Scan</span>
          </div>
          {bar("90%")}
          {bar("60%")}
        </div>
      );
    case "analyses":
      return (
        <div className="space-y-1.5">
          {[
            ["98", "bg-emerald-500"],
            ["74", "bg-amber-500"],
            ["41", "bg-red-500"],
          ].map(([n, c], i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${c} text-[7px] font-bold text-white`}>{n}</span>
              <div className="flex-1 space-y-1">{bar("80%")}{bar("50%")}</div>
            </div>
          ))}
        </div>
      );
    case "stats":
      return (
        <div className="flex h-14 items-end justify-between gap-1">
          {[40, 65, 30, 80, 55, 95].map((h, i) => (
            <span key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${h}%` }} />
          ))}
        </div>
      );
    case "chats":
      return (
        <div className="space-y-1.5">
          <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-edge p-1.5">{bar("90%")}</div>
          <div className="ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-accent p-1.5">{bar("70%", "bg-white/60")}</div>
          <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-edge p-1.5">{bar("60%")}</div>
        </div>
      );
    case "projects":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold ${n === 1 ? "bg-accent text-white" : "bg-edge text-ink-muted"}`}
              >
                {n}
              </span>
            ))}
          </div>
          {bar("100%")}
          {bar("65%")}
        </div>
      );
    case "messages":
      return (
        <div className="space-y-2">
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-1.5">{bar("85%")}</div>
          <div className="flex items-center gap-1 rounded-full border border-edge px-1.5 py-1">
            <span className="flex-1 text-[7px] text-ink-muted">Antwort …</span>
            <span className="h-3 w-3 rounded-full bg-accent" />
          </div>
        </div>
      );
    case "assistant":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-accent to-cyan-glow" />
            <span className="text-[7px] font-bold text-ink">KI-Assistent</span>
          </div>
          <div className="rounded-lg rounded-bl-sm bg-edge p-1.5">{bar("90%")}{<div className="h-0.5" />}{bar("70%")}</div>
        </div>
      );
    case "templates":
      return (
        <div className="space-y-1.5 rounded-md border border-edge p-1.5">
          <div className="flex justify-between">
            <div className="h-2 w-10 rounded bg-ink/20" />
            <span className="rounded bg-accent px-1.5 py-0.5 text-[6px] font-bold text-white">Kopieren</span>
          </div>
          {bar("100%")}{bar("90%")}{bar("95%")}{bar("60%")}
        </div>
      );
    case "security":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-[8px] text-white">✓</span>
            <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400">Geschützt</span>
          </div>
          {["SSL aktiv", "EU-Server", "Backups"].map((t) => (
            <div key={t} className="flex items-center gap-1 text-[7px] text-ink-soft">
              <span className="text-emerald-500">✓</span>
              {t}
            </div>
          ))}
        </div>
      );
  }
}
