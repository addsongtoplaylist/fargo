"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { leaveTrip } from "@/lib/actions/trip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { tintFor } from "@/components/trip-cover";
import { countryCode } from "@/lib/country-code";

const ROUND =
  "w-10 h-10 rounded-full bg-white/90 border border-line flex items-center justify-center text-fg shrink-0";

/**
 * Overview cover header (redesign P4). No photo yet (P10) → the trip's colour
 * with its country code large and faint. Back → My trips; planner gear /
 * member Leave (same confirm + rules as before).
 */
export function OverviewHeader({
  tripId,
  name,
  destination,
  subline,
  role,
}: {
  tripId: string;
  name: string;
  destination: string;
  subline: string;
  role: "planner" | "member" | undefined;
}) {
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const code = countryCode(destination);

  async function handleLeave() {
    const result = await leaveTrip(tripId);
    if (result.error) {
      alert(result.error);
    } else {
      router.push("/trips?noauto=1");
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4">
        <div className={`relative overflow-hidden rounded-[22px] h-[190px] p-4 flex flex-col justify-between ${tintFor(tripId)}`}>
          {code && (
            <span aria-hidden className="absolute -right-1.5 -top-5 text-[130px] font-extrabold tracking-[-4px] opacity-[0.14] leading-none">
              {code}
            </span>
          )}
          <div className="relative flex justify-between">
            <button type="button" onClick={() => router.push("/trips?noauto=1")} className={ROUND} aria-label="Back to My trips">
              <ArrowLeft size={19} strokeWidth={1.9} aria-hidden />
            </button>
            {role === "planner" && (
              <button type="button" onClick={() => router.push(`/trips/${tripId}/settings`)} className={ROUND} aria-label="Trip settings">
                <Settings size={18} strokeWidth={1.9} aria-hidden />
              </button>
            )}
            {role === "member" && (
              <button type="button" onClick={() => setShowLeaveDialog(true)} className={ROUND} aria-label="Leave trip">
                <LogOut size={18} strokeWidth={1.9} aria-hidden />
              </button>
            )}
          </div>
          <div className="relative">
            <p className="text-xs font-semibold tracking-[1.2px] uppercase">{destination}</p>
            <h1 className="text-[26px] font-bold text-fg leading-tight mt-1 truncate">{name}</h1>
            <p className="text-[13px] text-fg-muted mt-1">{subline}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showLeaveDialog}
        title="Leave trip"
        message={`You'll be removed from "${name}" and it will disappear from your trips list.`}
        confirmLabel="Leave"
        destructive
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </>
  );
}
