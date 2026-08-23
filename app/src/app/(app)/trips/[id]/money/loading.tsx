import { Column } from "@/components/column";
import { Skeleton } from "@/components/skeleton";

export default function MoneyLoading() {
  return (
    <Column className="py-4 pb-8">
      {/* Budget card */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4">
        <Skeleton className="h-3 w-16 mb-3" />
        <div className="flex items-baseline justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1.5 items-end flex flex-col">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full mt-3" />
      </div>

      {/* Expenses header */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Expense rows */}
      <div className="space-y-3">
        <div>
          <Skeleton className="h-3 w-32 mb-1.5" />
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2.5 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <Skeleton className="w-5 h-5 rounded shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="space-y-1 flex flex-col items-end">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Column>
  );
}
