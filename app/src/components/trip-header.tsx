"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { leaveTrip } from "@/lib/actions/trip";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function TripHeader() {
  const router = useRouter();
  const trip = useTrip();
  const isPlanner = trip?.myRole === "planner";
  const isMember = trip?.myRole && trip.myRole !== "planner";
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

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
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex items-center h-12 gap-3">
          <button
            onClick={() => router.push("/trips?noauto=1")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink transition-colors -ml-2"
            aria-label="Back to My trips"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate leading-tight">
              {trip?.name || "Trip"}
            </h1>
            <p className="text-[11px] text-muted truncate leading-tight">
              {trip?.destination}
            </p>
          </div>
          {isPlanner && (
            <button
              onClick={() => router.push(`/trips/${trip?.id}/settings`)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink transition-colors -mr-2"
              aria-label="Trip settings"
            >
              <Settings size={18} />
            </button>
          )}
          {isMember && (
            <button
              onClick={() => setShowLeaveDialog(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-red-500 transition-colors -mr-2"
              aria-label="Leave trip"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
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
