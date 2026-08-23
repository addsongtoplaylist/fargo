import { Column } from "@/components/column";
import { Skeleton } from "@/components/skeleton";

export default function TripsLoading() {
  return (
    <Column className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Trip cards */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg border border-border p-4 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    </Column>
  );
}
