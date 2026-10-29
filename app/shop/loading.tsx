export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-32 animate-pulse bg-gold/20" />
      <div className="mt-5 h-10 w-72 animate-pulse bg-white/5" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="card aspect-[3/4] animate-pulse" />)}
      </div>
    </div>
  );
}
