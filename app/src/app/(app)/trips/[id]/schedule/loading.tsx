import { Bone } from "@/components/ui/bone";

/** Matches the redesigned Schedule: date strip, map card, day card timeline. */
export default function ScheduleLoading() {
  return (
    <div className="pb-4">
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-2 py-2 flex items-center gap-1">
        <div className="w-8 shrink-0" />
        <div className="flex gap-1.5 flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="w-[50px] h-[58px] rounded-[14px] shrink-0" />
          ))}
        </div>
        <div className="w-8 shrink-0" />
      </div>
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-1 space-y-3">
        <Bone className="h-12 rounded-card" />
        <div className="bg-surface rounded-card p-4 space-y-4">
          <Bone className="h-4 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-3 w-10" />
              <Bone className="h-[34px] w-[34px] rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Bone className="h-3.5 w-3/4" />
                <Bone className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
