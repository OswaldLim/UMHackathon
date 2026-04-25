export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 rounded-full bg-amber-400/60 animate-pulse" />
        <p className="font-body text-sm text-ink/50">
          Analysing your business context and retrieving relevant data…
        </p>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-ink/5 p-5 space-y-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2">
            <div className="shimmer w-5 h-5 rounded-full" />
            <div className="shimmer h-4 w-24 rounded-full" />
          </div>
          <div className="shimmer h-3 w-full rounded-full" />
          <div className="shimmer h-3 w-4/5 rounded-full" />
          <div className="shimmer h-3 w-3/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
