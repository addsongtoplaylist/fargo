import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TripCover } from "@/components/trip-cover";

/** Compact trip row for the home sheet's Upcoming and Past trips lists. */
export function TripRow({
  id,
  href,
  name,
  destination,
  dates,
  coverPath,
  coverPosition,
  meta,
}: {
  id: string;
  href: string;
  name: string;
  destination: string;
  dates: string;
  /** Replaces "destination · dates" (e.g. "In 21 days · 13 Nov – 16 Nov 2026") */
  meta?: string;
  coverPath?: string | null;
  coverPosition?: number | null;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2">
      <TripCover tripId={id} destination={destination} coverPath={coverPath} coverPosition={coverPosition} size={52} radius={12} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg truncate">{name}</p>
        <p className="text-xs text-fg-muted truncate mt-0.5">
          {meta ?? `${destination} · ${dates}`}
        </p>
      </div>
      <ChevronRight size={16} className="text-fg-muted shrink-0" aria-hidden />
    </Link>
  );
}
