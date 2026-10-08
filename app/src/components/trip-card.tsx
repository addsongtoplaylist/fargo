import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TripCover } from "@/components/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";

/**
 * My trips card (DESIGN.md v0.8 — cover beside the text). `current` = the
 * trip you're on: bigger cover, blue outline, filled chip.
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
      className={`flex items-center gap-3.5 bg-surface rounded-[20px] p-2.5 ${current ? "ring-[1.5px] ring-inset ring-brand" : ""}`}
    >
      <TripCover tripId={id} destination={destination} coverPath={coverPath} coverPosition={coverPosition} size={current ? 104 : 92} />
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-base font-semibold text-fg truncate">{name}</p>
        <p className="text-[13px] text-fg-muted truncate">
          {destination} · {dates}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              current ? "bg-brand text-brand-on" : "bg-brand-soft text-brand"
            }`}
          >
            {chip}
          </span>
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
