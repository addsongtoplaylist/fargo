import Link from "next/link";
import { TravellerAvatars } from "./traveller-avatars";

type ActiveTrip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  currentDay: number;
  totalDays: number;
  travellers: { name: string; avatar: string | null }[];
  color: string;
};

export function HeroTripCard({
  trip,
  variant,
}: {
  trip: ActiveTrip;
  variant: "active";
}) {
  return (
    <Link
      href={`/trips/${trip.id}/overview`}
      className={`block rounded-lg p-4 text-white ${trip.color}`}
    >
      {/* Active now indicator */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="text-xs font-medium text-white/90">Active now</span>
      </div>

      {/* Trip type chip */}
      <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-medium bg-white/20 mb-2">
        {trip.tripType}
      </span>

      {/* Trip name + destination */}
      <h2 className="text-lg font-semibold mb-0.5">{trip.name}</h2>
      <p className="text-sm text-white/80 mb-0.5">{trip.destination}</p>

      {/* Dates */}
      <p className="text-xs text-white/60 mb-4">
        {formatDateRange(trip.startDate, trip.endDate)} · {trip.totalDays} days
      </p>

      {/* Day counter — hero number */}
      <div className="flex items-end justify-between">
        <div>
          <span className="block text-[42px] font-medium leading-none tabular-nums">
            Day {trip.currentDay}
          </span>
          <span className="text-sm text-white/80">of {trip.totalDays}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <TravellerAvatars travellers={trip.travellers} size={26} />
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white/20">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", opts)} ${e.getFullYear()}`;
}
