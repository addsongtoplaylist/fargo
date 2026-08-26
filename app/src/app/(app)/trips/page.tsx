import { Column } from "@/components/column";
import { HeroTripCard } from "@/components/hero-trip-card";
import { CompactTripCard } from "@/components/compact-trip-card";
import { EmptyTrips } from "@/components/empty-trips";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getMyTrips, getActiveTrip } from "@/lib/actions/trip";
import { differenceInCalendarDays } from "date-fns";
import { redirect } from "next/navigation";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ noauto?: string }>;
}) {
  const { noauto } = await searchParams;

  // Fast auto-land: lightweight query for active trip only (1 query vs 3+)
  if (!noauto) {
    const activeTripId = await getActiveTrip();
    if (activeTripId) {
      redirect(`/trips/${activeTripId}/schedule`);
    }
  }

  const { active, upcoming, past } = await getMyTrips();
  const today = new Date();
  const hasTrips = active || upcoming.length > 0 || past.length > 0;

  return (
    <Column className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My trips</h1>
        <Link
          href="/trips/new"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <Plus size={18} />
          New trip
        </Link>
      </div>

      {!hasTrips ? (
        <EmptyTrips />
      ) : (
        <div className="flex flex-col gap-3">
          {active && (
            <HeroTripCard
              trip={formatActiveTrip(active, today)}
              variant="active"
            />
          )}

          {upcoming.map((trip) => (
            <CompactTripCard
              key={trip.id}
              trip={formatUpcomingTrip(trip, today)}
            />
          ))}

          {past.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-muted mb-2">
                Past trips
              </h2>
              {past.map((trip: any) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}/overview`}
                  className="block bg-card rounded-md border border-border p-3 mb-2"
                >
                  <h3 className="text-sm font-semibold text-ink">{trip.name}</h3>
                  <p className="text-xs text-muted">{trip.destination}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-muted">
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </span>
                    {trip.travellers && trip.travellers.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {trip.travellers.slice(0, 4).map((t: any, i: number) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full bg-accent/20 border border-card flex items-center justify-center text-[8px] font-medium text-accent"
                            >
                              {t.display_name?.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-muted">
                          {trip.travellers.length}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </Column>
  );
}

// Trip colour rotation — cool/neutral palette
const TRIP_COLORS = [
  "bg-accent", // Active: Electric Blue #0085D9
  "bg-trip-blue-1", // Upcoming 1: Slate-blue #7BA3B8
  "bg-trip-blue-2", // Upcoming 2: Dusty blue #6B96A8
  "bg-trip-green-1", // Upcoming 3: Cool sage #7DB5A0
];

function getTripColor(index: number) {
  return TRIP_COLORS[index % TRIP_COLORS.length];
}

const TRIP_TYPE_LABELS: Record<string, string> = {
  free_and_easy: "Free & easy",
  city_break: "City break",
  road_trip: "Road trip",
  beach_and_resort: "Beach & resort",
  adventure: "Adventure",
  business: "Business",
};

function formatActiveTrip(trip: any, today: Date) {
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const currentDay = differenceInCalendarDays(today, start) + 1;
  const totalDays = differenceInCalendarDays(end, start) + 1;

  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    tripType: TRIP_TYPE_LABELS[trip.trip_type] || trip.trip_type,
    currentDay,
    totalDays,
    travellers: (trip.travellers || []).map((t: any) => ({
      name: t.display_name,
      avatar: null,
    })),
    color: TRIP_COLORS[0],
  };
}

function formatUpcomingTrip(trip: any, today: Date) {
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const daysUntil = differenceInCalendarDays(start, today);
  const totalDays = differenceInCalendarDays(end, start) + 1;

  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    tripType: TRIP_TYPE_LABELS[trip.trip_type] || trip.trip_type,
    daysUntil,
    travellers: (trip.travellers || []).map((t: any) => ({
      name: t.display_name,
      avatar: null,
    })),
    color: TRIP_COLORS[1],
  };
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", opts)} ${e.getFullYear()}`;
}
