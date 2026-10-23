"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";

type Traveller = { id: string; display_name: string; account_id: string | null };

/**
 * Planner's way out of a trip: hand the trip to another traveller with an
 * account and leave, or delete it for everyone. Name-only travellers can't
 * be planner (they never sign in).
 */
export function LeaveOrDeleteSheet({
  open,
  tripName,
  plannerAccountId,
  travellers,
  onClose,
  onHandOver,
  onDelete,
}: {
  open: boolean;
  tripName: string;
  plannerAccountId: string;
  travellers: Traveller[];
  onClose: () => void;
  onHandOver: (travellerId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"handover" | "delete" | null>(null);

  const candidates = travellers.filter((t) => t.account_id && t.account_id !== plannerAccountId);
  const pickedName = candidates.find((t) => t.id === picked)?.display_name ?? "";

  function close() {
    setPicked(null);
    setConfirm(null);
    onClose();
  }

  return (
    <>
      <Sheet open={open && !confirm} title="Leave or delete trip" onClose={close}>
        <div className="space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <section>
            <h3 className="text-[15px] font-semibold text-fg">Hand over and leave</h3>
            <p className="text-[13px] text-fg-muted mt-1 leading-relaxed">
              Pick a new planner. The trip stays as it is for everyone else.
            </p>
            {candidates.length > 0 && (
              <div role="radiogroup" aria-label="New planner" className="mt-3 flex flex-wrap gap-3">
                {candidates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={picked === t.id}
                    onClick={() => setPicked(t.id)}
                    className="flex flex-col items-center gap-1.5 w-[64px]"
                  >
                    <Avatar name={t.display_name} selected={picked === t.id} />
                    <span className="text-xs text-fg truncate w-full text-center">{t.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            <Button
              full
              className="mt-4"
              disabled={!picked}
              onClick={() => setConfirm("handover")}
            >
              {picked ? `Make ${pickedName} planner and leave` : "Hand over and leave"}
            </Button>
          </section>

          <div className="h-px bg-line" aria-hidden />

          <section>
            <h3 className="text-[15px] font-semibold text-fg">Delete for everyone</h3>
            <Button variant="danger-outline" full className="mt-3" onClick={() => setConfirm("delete")}>
              Delete trip
            </Button>
          </section>
        </div>
      </Sheet>

      <Confirm
        open={confirm === "handover"}
        title="Hand over and leave"
        message={`${pickedName} becomes the planner of "${tripName}" and you leave the trip. You'll need a new invite to rejoin.`}
        confirmLabel="Hand over"
        destructive={false}
        onConfirm={async () => {
          if (picked) await onHandOver(picked);
        }}
        onCancel={() => setConfirm(null)}
      />
      <Confirm
        open={confirm === "delete"}
        title="Delete trip"
        message={`Are you sure you want to delete "${tripName}"? This will permanently remove all activities, expenses, checklists, and traveller data. All members will lose access. This cannot be undone.`}
        onConfirm={onDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
