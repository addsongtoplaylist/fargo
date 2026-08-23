import { Skeleton } from "@/components/skeleton";

export default function TripLoading() {
  return (
    <div className="min-h-full bg-ground">
      {/* Header skeleton */}
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex items-center h-12 gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </header>

      {/* Tab bar skeleton */}
      <nav className="bg-card border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex gap-4 py-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </nav>

      {/* Content skeleton */}
      <div className="mx-auto max-w-[var(--max-width-column)] px-4 py-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
