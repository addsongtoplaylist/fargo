import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { TripCover } from "@/components/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";

/**
 * My trips card for current and upcoming trips: full-width cover on top,
 * countdown on the photo, then name, destination · dates and travellers.
 * `current` = the trip you're on: blue outline, filled chip.
 */
export function TripCard({
  id,
  href,
  name,
  destination,
  dates,
  chip,
  travellers,
  coverPath,
  coverPosition,
  current = false,
}: {
  id: string;
  coverPath?: string | null;
  coverPosition?: number | null;
  href: string;
  name: string;
  destination: string;
  dates: string;
  chip: string;
  travellers: string[];
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block bg-surface rounded-[20px] p-2.5 ${current ? "ring-[1.5px] ring-inset ring-brand" : ""}`}
    >
      <div className="relative">
        <TripCover tripId={id} destination={destination} coverPath={coverPath} coverPosition={coverPosition} wide />
        <span
          className={`absolute top-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm ${
            current ? "bg-brand text-brand-on" : "bg-surface text-brand"
          }`}
        >
          {chip}
        </span>
      </div>
      <div className="px-1.5 pt-3 pb-1.5">
        <p className="text-[20px] font-bold text-fg leading-tight truncate">{name}</p>
        <div className="flex items-center justify-between gap-3 mt-1.5">
          <p className="flex items-center gap-1.5 min-w-0 text-[13px] text-fg-muted">
            <Compass size={15} strokeWidth={2} className="shrink-0" aria-hidden />
            <span className="truncate">
              {destination} · {dates}
            </span>
          </p>
          {travellers.length > 0 && <AvatarStack names={travellers} />}
        </div>
      </div>
    </Link>
  );
}

/** Past trip: compact row inside the "Past trips" card. */
export function PastTripRow({
  id,
  href,
  name,
  destination,
  dates,
  coverPath,
  coverPosition,
}: {
  id: string;
  href: string;
  name: string;
  destination: string;
  dates: string;
  coverPath?: string | null;
  coverPosition?: number | null;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2">
      <TripCover tripId={id} destination={destination} coverPath={coverPath} coverPosition={coverPosition} size={52} radius={12} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg truncate">{name}</p>
        <p className="text-xs text-fg-muted truncate mt-0.5">
          {destination} · {dates}
        </p>
      </div>
      <ChevronRight size={16} className="text-fg-muted shrink-0" aria-hidden />
    </Link>
  );
}
