import { Skeleton } from "@/components/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-column)] py-2 pb-8">
      {/* Day picker row */}
      <div className="px-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-11 h-14 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Day label */}
      <div className="px-4 pt-3 pb-2">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Activity cards */}
      <div className="px-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg border border-border p-3 flex items-start gap-3"
          >
            <Skeleton className="w-9 h-9 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}

        {/* Add activity button placeholder */}
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}
