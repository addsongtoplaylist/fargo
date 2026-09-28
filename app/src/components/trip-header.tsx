"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { leaveTrip } from "@/lib/actions/trip";
import { ConfirmDialog } from "@/components/confirm-dialog";

const TITLES: Record<string, string> = {
  overview: "Overview",
  schedule: "Schedule",
  money: "Money",
  prep: "Prep",
  discover: "Discover",
  settings: "Trip settings",
};

const ROUND =
  "w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-fg shrink-0 hover:border-fg-faint transition-colors";

/**
 * Trip header (DESIGN.md v0.8): round back (→ My trips), trip name caption,
 * section title. Planner gear / member Leave only on Overview (N7).
 * Overview gets its photo header in P4.
 */
export function TripHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const trip = useTrip();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const section = pathname.split(`/trips/${params.id}/`)[1]?.split("/")[0] ?? "overview";
  const onOverview = section === "overview";
  const isPlanner = trip?.myRole === "planner";
  const isMember = !!trip?.myRole && trip.myRole !== "planner";

  async function handleLeave() {
    if (!trip?.id) return;
    const result = await leaveTrip(trip.id);
    if (result.error) {
      alert(result.error);
    } else {
      router.push("/trips?noauto=1");
    }
  }

  return (
    <>
      <header className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4 pb-3 flex items-center gap-3">
        <button type="button" onClick={() => router.push("/trips?noauto=1")} className={ROUND} aria-label="Back to My trips">
          <ArrowLeft size={19} strokeWidth={1.9} aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-fg-muted truncate">{trip?.name || "Trip"}</p>
          <h1 className="text-[22px] font-bold text-fg leading-tight tracking-[-0.2px] truncate">
            {TITLES[section] ?? "Trip"}
          </h1>
        </div>
        {onOverview && isPlanner && (
          <button type="button" onClick={() => router.push(`/trips/${trip?.id}/settings`)} className={ROUND} aria-label="Trip settings">
            <Settings size={18} strokeWidth={1.9} aria-hidden />
          </button>
        )}
        {onOverview && isMember && (
          <button type="button" onClick={() => setShowLeaveDialog(true)} className={ROUND} aria-label="Leave trip">
            <LogOut size={18} strokeWidth={1.9} aria-hidden />
          </button>
        )}
      </header>

      <ConfirmDialog
        open={showLeaveDialog}
        title="Leave trip"
        message={`You'll be removed from "${trip?.name}" and it will disappear from your trips list.`}
        confirmLabel="Leave"
        destructive
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </>
  );
}
