import { Column } from "@/components/column";
import { Bone } from "@/components/ui/bone";

/** Matches the redesigned Money page: My budget, Group split, What you paid. */
export default function MoneyLoading() {
  return (
    <Column className="py-4 pb-8 space-y-3">
      <div className="bg-surface rounded-card p-4">
        <Bone className="h-4 w-24" />
        <div className="mt-3 flex items-start justify-between">
          <div className="space-y-1.5">
            <Bone className="h-7 w-36" />
            <Bone className="h-3 w-28" />
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <Bone className="h-5 w-24" />
            <Bone className="h-3 w-16" />
          </div>
        </div>
        <Bone className="h-2 w-full rounded-full mt-3" />
      </div>
      <Bone className="h-[110px] rounded-card" />
      <div className="bg-surface rounded-card p-4 space-y-3">
        <Bone className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-1 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Column>
  );
}
