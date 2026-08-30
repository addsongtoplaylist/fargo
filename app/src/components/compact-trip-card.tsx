import Link from "next/link";
import { TravellerAvatars } from "./traveller-avatars";

type CompactTrip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  daysUntil: number;
  travellers: { name: string; avatar: string | null }[];
  color: string;
  variant?: "upcoming" | "active";
};

export function CompactTripCard({ trip }: { trip: CompactTrip }) {
  return (
    <Link
      href={`/trips/${trip.id}/${trip.variant === "active" ? "schedule" : "overview"}`}
      className={`block rounded-lg p-3 text-white ${trip.color}`}
    >
      <div className="flex items-start justify-between">
        {/* Left: chip + destination + dates */}
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-medium bg-white/20 mb-1.5">
            {trip.tripType}
          </span>
          <h3 className="text-base font-semibold truncate">
            {trip.name}
          </h3>
          <p className="text-xs text-white/80 truncate">{trip.destination}</p>
          <p className="text-xs text-white/80 mt-0.5">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>

        {/* Right: countdown / day indicator */}
        <div className="text-right ml-3 shrink-0">
          <span className="block text-[28px] font-medium leading-none tabular-nums">
            {trip.daysUntil}
          </span>
          <span className="text-xs text-white/80">
            {trip.variant === "active" ? "day" : "days to go"}
          </span>
        </div>
      </div>

      {/* Traveller avatars */}
      <div className="mt-2">
        <TravellerAvatars travellers={trip.travellers} size={22} />
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
