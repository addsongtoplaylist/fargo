import { Column } from "@/components/column";
import { Skeleton } from "@/components/skeleton";

export default function PeopleLoading() {
  return (
    <Column className="py-4 space-y-3">
      {/* Invite button */}
      <Skeleton className="w-full h-10 rounded-lg" />

      {/* Traveller rows */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-card rounded-lg border border-border p-3"
        >
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </Column>
  );
}
