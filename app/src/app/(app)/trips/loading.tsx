import { Column } from "@/components/column";
import { Bone } from "@/components/ui/bone";

/** Matches the redesigned My trips: title, current trip card, upcoming card. */
export default function TripsLoading() {
  return (
    <Column className="pt-12 pb-8">
      <Bone className="h-8 w-36 mb-6" />
      <div className="space-y-3">
        {[104, 92].map((size, i) => (
          <div key={i} className="bg-surface rounded-card p-3 flex gap-3.5">
            <Bone className="rounded-[14px] shrink-0" style={{ width: size, height: size }} />
            <div className="flex-1 space-y-2 pt-1.5">
              <Bone className="h-4 w-2/3" />
              <Bone className="h-3 w-1/2" />
              <Bone className="h-6 w-24 rounded-full mt-3" />
            </div>
          </div>
        ))}
      </div>
    </Column>
  );
}
