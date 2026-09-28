"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { updateTraveller } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";

type ShareTraveller = {
  id: string;
  display_name: string;
  default_shares?: number | null;
  account_id?: string | null;
};

const STEP =
  "w-[34px] h-[34px] rounded-full border border-line bg-surface flex items-center justify-center text-fg disabled:opacity-40";

/**
 * Split shares (planner, redesign P6 — moved here from the Overview person
 * panel). Each − / + saves straight away with the same `updateTraveller`
 * call as before (D3: default shares for "Split as: Shares").
 */
export function SplitSharesSheet({
  tripId,
  travellers,
  onClose,
}: {
  tripId: string;
  travellers: ShareTraveller[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function change(t: ShareTraveller, next: number) {
    if (busyId || next < 1) return;
    setBusyId(t.id);
    try {
      const result = await updateTraveller(tripId, t.id, { shares: next });
      if (result.error) toast(result.error, "error");
      else router.refresh();
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Sheet open title="Split shares" onClose={onClose}>
      <p className="text-[13px] text-fg-muted mb-2">Used when an expense is split by shares.</p>
      <div className="divide-y divide-line">
        {travellers.map((t) => {
          const shares = t.default_shares ?? 1;
          const busy = busyId === t.id;
          return (
            <div key={t.id} className="flex items-center gap-3 py-2.5">
              <Avatar name={t.display_name} kind={t.account_id === null ? "name-only" : "account"} size={36} />
              <span className="flex-1 min-w-0 text-[15px] font-medium text-fg truncate">{t.display_name}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => change(t, shares - 1)}
                  disabled={!!busyId || shares <= 1}
                  aria-label={`Fewer shares for ${t.display_name}`}
                  className={STEP}
                >
                  <Minus size={16} strokeWidth={2} aria-hidden />
                </button>
                <span className={`w-4 text-center text-base font-semibold tabular-nums ${busy ? "opacity-40" : ""}`}>
                  {shares}
                </span>
                <button
                  type="button"
                  onClick={() => change(t, shares + 1)}
                  disabled={!!busyId}
                  aria-label={`More shares for ${t.display_name}`}
                  className={STEP}
                >
                  <Plus size={16} strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
