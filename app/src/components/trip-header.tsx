"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { useTrip } from "@/lib/trip-context";

export function TripHeader() {
  const router = useRouter();
  const trip = useTrip();

  return (
    <header className="bg-card border-b border-border">
      <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex items-center h-12 gap-3">
        <button
          onClick={() => router.push("/trips?noauto=1")}
          className="text-muted hover:text-ink transition-colors -ml-1"
          aria-label="Back to My trips"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">
            {trip?.destination || "Trip"}
          </h1>
        </div>
        <button
          className="text-muted hover:text-ink transition-colors"
          aria-label="Trip settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
