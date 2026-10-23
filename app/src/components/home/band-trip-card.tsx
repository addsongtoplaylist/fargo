import Link from "next/link";
import { TripCover } from "@/components/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";
import type { NowItem } from "@/lib/trip-now";

/**
 * Trip card in the home sky band (v0.7.0): cover photo with the countdown
 * chip, name, destination · dates, travellers, and — for a trip you're on —
 * what's happening now (or next) today.
 */
export function BandTripCard({
  id,
  href,
  name,
  destination,
  dates,
  chip,
  travellers,
  coverPath,
  coverPosition,
  now,
  ongoing,
}: {
  id: string;
  href: string;
  name: string;
  destination: string;
  dates: string;
  chip: string;
  travellers: string[];
  coverPath?: string | null;
  coverPosition?: number | null;
  now?: (NowItem & { label: string }) | null;
  ongoing: boolean;
}) {
  return (
    <Link href={href} className="block h-full bg-surface rounded-[20px] p-2 shadow-float">
      <div className="relative">
        <TripCover tripId={id} destination={destination} coverPath={coverPath} coverPosition={coverPosition} wide radius={14} />
        <span
          className={`absolute top-2 left-2 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            ongoing ? "bg-brand text-brand-on" : "bg-surface text-brand"
          }`}
        >
          {chip}
        </span>
      </div>
      <div className="px-2 pt-2.5 pb-1.5">
        <p className="text-[18px] font-bold text-fg leading-tight truncate">{name}</p>
        <div className="flex items-center justify-between gap-3 mt-1">
          <p className="text-[13px] text-fg-muted truncate min-w-0">
            {destination} · {dates}
          </p>
          {travellers.length > 0 && <AvatarStack names={travellers} />}
        </div>
        {now && (
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-line">
            <span className="text-[10px] font-bold tracking-[0.4px] text-brand bg-brand-soft px-2 py-0.5 rounded-full shrink-0">
              {now.tag === "now" ? "NOW" : "NEXT"}
            </span>
            <span className="text-[13px] font-semibold text-fg truncate">{now.title}</span>
            <span className="text-[13px] text-fg-muted tabular-nums ml-auto shrink-0">{now.label}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
