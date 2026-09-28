import { Column } from "@/components/column";
import { EmptyTrips } from "@/components/empty-trips";
import { TripCard, PastTripRow } from "@/components/trip-card";
import { Fab } from "@/components/ui/fab";
import { getMyTrips, getActiveTrip, type MyTrip } from "@/lib/actions/trip";
import { differenceInCalendarDays } from "date-fns";
import { redirect } from "next/navigation";
import { formatDateRange } from "@/lib/dates";

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
  const hasTrips = active.length > 0 || upcoming.length > 0 || past.length > 0;

  return (
    <Column className="pt-14">
      <h1 className="text-[30px] font-bold tracking-[-0.5px] text-fg mb-5">My trips</h1>

      {!hasTrips ? (
        <EmptyTrips />
      ) : (
        <div className="flex flex-col gap-3">
          {/* First active trip opens Overview; any other active trip opens Schedule (as before) */}
          {active.map((trip, i) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              href={`/trips/${trip.id}/${i === 0 ? "overview" : "schedule"}`}
              name={trip.name}
              destination={trip.destination}
              dates={formatDateRange(trip.start_date, trip.end_date)}
              chip={dayOfTrip(trip, today)}
              travellers={names(trip)}
              current={i === 0}
            />
          ))}

          {upcoming.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              href={`/trips/${trip.id}/overview`}
              name={trip.name}
              destination={trip.destination}
              dates={formatDateRange(trip.start_date, trip.end_date)}
              chip={countdown(trip, today)}
              travellers={names(trip)}
            />
          ))}

          {past.length > 0 && (
            <section className="mt-3">
              <h2 className="text-base font-semibold text-fg px-1 mb-3">Past trips</h2>
              <div className="bg-surface rounded-card p-1 divide-y divide-line">
                {past.map((trip) => (
                  <PastTripRow
                    key={trip.id}
                    id={trip.id}
                    href={`/trips/${trip.id}/overview`}
                    name={trip.name}
                    destination={trip.destination}
                    dates={formatDateRange(trip.start_date, trip.end_date)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty screen already has a New trip button */}
      {hasTrips && <Fab label="New trip" href="/trips/new" />}
    </Column>
  );
}

function names(trip: MyTrip) {
  return (trip.travellers || []).map((t) => t.display_name);
}

/** "Day X of Y" — same maths as before the redesign. */
function dayOfTrip(trip: MyTrip, today: Date) {
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const currentDay = differenceInCalendarDays(today, start) + 1;
  const totalDays = differenceInCalendarDays(end, start) + 1;
  return `Day ${currentDay} of ${totalDays}`;
}

/** "In N days" — same maths as the old "N days to go". */
function countdown(trip: MyTrip, today: Date) {
  const daysUntil = differenceInCalendarDays(new Date(trip.start_date), today);
  return daysUntil === 1 ? "In 1 day" : `In ${daysUntil} days`;
}
