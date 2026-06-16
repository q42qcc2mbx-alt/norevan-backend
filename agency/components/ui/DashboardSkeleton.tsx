// Lightweight loading placeholder for the dashboards — feels faster and more
// premium than a bare spinner while the session + data load.
export default function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-28 pb-20 md:px-8 md:pt-32" aria-hidden>
      <div className="h-8 w-52 animate-pulse rounded-lg bg-edge" />
      <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-edge/60" />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-elevated h-28 animate-pulse" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-elevated h-56 animate-pulse" />
        <div className="card-elevated h-56 animate-pulse" />
      </div>
    </section>
  );
}
