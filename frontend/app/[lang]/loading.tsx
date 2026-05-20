export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6 md:px-10"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-px w-24 overflow-hidden bg-border">
          <div className="h-full w-1/3 origin-left animate-[loading_1.2s_ease-in-out_infinite] bg-foreground" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          Loading
        </span>
      </div>
      <style>{`
        @keyframes loading {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
