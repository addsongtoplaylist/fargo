"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { useTrip } from "@/lib/trip-context";

export function TripHeader() {
  const router = useRouter();
  const trip = useTrip();
  const isPlanner = trip?.myRole === "planner";

  return (
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
      </div>
    </header>
  );
}
