import { Column } from "@/components/column";
import { Bone } from "@/components/ui/bone";

/** Matches the redesigned Overview: cover header, time card, plan card, travellers. */
export default function OverviewLoading() {
  return (
    <>
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4">
        <Bone className="h-[190px] rounded-[22px]" />
      </div>
      <Column className="pt-4 space-y-3">
        <Bone className="h-[70px] rounded-card" />
        <div className="bg-surface rounded-card p-4 space-y-4">
          <Bone className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-3 w-10" />
              <Bone className="h-8 w-8 rounded-full" />
              <Bone className="h-3 flex-1" />
            </div>
          ))}
        </div>
        <Bone className="h-[120px] rounded-card" />
      </Column>
    </>
  );
}
