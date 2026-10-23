import Link from "next/link";
import { TripCover } from "@/components/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";

/**
 * Trip card in the home sky band (v0.7.0): cover photo with the countdown
 * chip, name, destination · dates and travellers.
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
      </div>
    </Link>
  );
}
