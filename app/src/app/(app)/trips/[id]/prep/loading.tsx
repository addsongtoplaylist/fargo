import { Column } from "@/components/column";
import { Skeleton } from "@/components/skeleton";

export default function PrepLoading() {
  return (
    <Column className="py-4 pb-8 space-y-6">
      {/* Bookings section */}
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="bg-card rounded-lg border border-border px-3 py-4">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>

      {/* Checklists section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="bg-card rounded-lg border border-border p-3 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Ideas section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg border border-border p-3 flex items-center gap-2"
            >
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="w-6 h-6 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Column>
  );
}
