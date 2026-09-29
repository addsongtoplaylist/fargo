import { Column } from "@/components/column";
import { Bone } from "@/components/ui/bone";

/** Matches the redesigned Prep: Checklists card(s), Ideas card. */
export default function PrepLoading() {
  return (
    <Column className="py-4 pb-8 space-y-6">
      <div>
        <Bone className="h-4 w-24 mb-2.5 ml-1" />
        <div className="bg-surface rounded-card p-4 space-y-4">
          <Bone className="h-4 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="w-[22px] h-[22px] rounded-full shrink-0" />
              <Bone className="h-3.5 flex-1" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Bone className="h-4 w-16 mb-2.5 ml-1" />
        <div className="bg-surface rounded-card p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-4 flex-1" />
              <Bone className="h-9 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Column>
  );
}
