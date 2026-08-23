import { Column } from "@/components/column";
import { Skeleton } from "@/components/skeleton";

export default function OverviewLoading() {
  return (
    <Column className="py-4 pb-8 space-y-4">
      {/* Share button */}
      <Skeleton className="w-full h-10 rounded-lg" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-3">
            <Skeleton className="h-2.5 w-16 mb-2" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
        ))}
      </div>
    </Column>
  );
}
