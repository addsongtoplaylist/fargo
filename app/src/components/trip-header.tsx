"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTrip } from "@/lib/trip-context";

const TITLES: Record<string, string> = {
  schedule: "Schedule",
  money: "Money",
  prep: "Prep",
  discover: "Discover",
  settings: "Trip settings",
};

/**
 * Trip header for every section except Overview (which has its own cover
 * header with the gear / Leave): round back (→ My trips), trip name caption,
 * section title (DESIGN.md v0.8).
 */
export function TripHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const trip = useTrip();

  const section = pathname.split(`/trips/${params.id}/`)[1]?.split("/")[0] ?? "overview";
  if (section === "overview") return null;

  return (
    <header className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4 pb-3 flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push("/trips?noauto=1")}
        className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-fg shrink-0 hover:border-fg-faint transition-colors"
        aria-label="Back to My trips"
      >
        <ArrowLeft size={19} strokeWidth={1.9} aria-hidden />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-fg-muted truncate">{trip?.name || "Trip"}</p>
        <h1 className="text-[22px] font-bold text-fg leading-tight tracking-[-0.2px] truncate">{TITLES[section] ?? "Trip"}</h1>
      </div>
    </header>
  );
}
