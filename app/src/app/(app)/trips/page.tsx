import { Column } from "@/components/column";
import { TripRow } from "@/components/trip-card";
import { SkyBand } from "@/components/home/sky-band";
import { TripSwipe } from "@/components/home/trip-swipe";
import { BandTripCard } from "@/components/home/band-trip-card";
import { getMyTrips, type MyTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { countStampsToCollect } from "@/lib/actions/stamps";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDateRange } from "@/lib/dates";

const PAST_SHOWN = 3;

/**
 * Home (v0.7.0, owner-approved redesign): a sky band with greeting, your
 * avatar (→ Profile), the trip(s) you're on — or the next upcoming one — in a
 * swipe row, and New trip · Discover · Passport shortcuts; then a sheet with
 * the other upcoming trips and past trips (latest 3, "See all" for the rest).
 */
export default async function TripsPage() {
  // Home is always the first screen (v0.7.0: no more jumping straight into the current trip)
  const [{ active, upcoming, past }, account] = await Promise.all([getMyTrips(), getOrCreateAccount()]);

  const byStart = (a: MyTrip, b: MyTrip) => a.start_date.localeCompare(b.start_date);
  const ongoing = [...active].sort((a, b) => b.start_date.localeCompare(a.start_date)); // most recent start first
  const later = [...upcoming].sort(byStart);
  const pastNewest = [...past].sort((a, b) => b.end_date.localeCompare(a.end_date));

  // The band shows the trip(s) you're on; between trips, the next upcoming one
  const bandTrips = ongoing.length > 0 ? ongoing : later.slice(0, 1);
  const sheetUpcoming = ongoing.length > 0 ? later : later.slice(1);

  const stampsToCollect = await countStampsToCollect([...active, ...upcoming, ...past]);

  const firstName = (account?.name ?? "").trim().split(/\s+/)[0] || "there";
  const initial = (account?.name?.[0] ?? "?").toUpperCase();

  return (
    <>
      <SkyBand firstName={firstName} initial={initial} stampsToCollect={stampsToCollect}>
        {bandTrips.length > 0 && (
          <TripSwipe>
            {bandTrips.map((trip) => {
              const isOngoing = ongoing.includes(trip);
              return (
                <BandTripCard
                  key={trip.id}
                  id={trip.id}
                  // Ongoing → today's Schedule; upcoming → Overview
                  href={`/trips/${trip.id}/${isOngoing ? "schedule" : "overview"}`}
                  name={trip.name}
                  destination={trip.destination}
                  dates={formatDateRange(trip.start_date, trip.end_date)}
                  chip={isOngoing ? dayOfTrip(trip) : countdown(trip)}
                  travellers={names(trip)}
                  coverPath={trip.cover_path}
                  coverPosition={trip.cover_position}
                  ongoing={isOngoing}
                />
              );
            })}
          </TripSwipe>
        )}
      </SkyBand>

      {(sheetUpcoming.length > 0 || pastNewest.length > 0) && (
        <div className="relative -mt-6 rounded-t-[24px] bg-page pt-5">
          <Column className="space-y-5">
            {sheetUpcoming.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-fg px-1 mb-2.5">Upcoming</h2>
                <div className="bg-surface rounded-card p-1 divide-y divide-line">
                  {sheetUpcoming.map((trip) => (
                    <TripRow
                      key={trip.id}
                      id={trip.id}
                      coverPath={trip.cover_path}
                      coverPosition={trip.cover_position}
                      href={`/trips/${trip.id}/overview`}
                      name={trip.name}
                      destination={trip.destination}
                      dates={formatDateRange(trip.start_date, trip.end_date)}
                      meta={`${countdown(trip)} · ${formatDateRange(trip.start_date, trip.end_date)}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {pastNewest.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-fg px-1 mb-2.5">Past trips</h2>
                <div className="bg-surface rounded-card p-1 divide-y divide-line">
                  {pastNewest.slice(0, PAST_SHOWN).map((trip) => (
                    <TripRow
                      key={trip.id}
                      id={trip.id}
                      coverPath={trip.cover_path}
                      coverPosition={trip.cover_position}
                      href={`/trips/${trip.id}/overview`}
                      name={trip.name}
                      destination={trip.destination}
                      dates={formatDateRange(trip.start_date, trip.end_date)}
                    />
                  ))}
                  {pastNewest.length > PAST_SHOWN && (
                    <details className="group">
                      <summary className="list-none cursor-pointer text-center text-[13px] font-medium text-brand py-3 group-open:hidden">
                        See all {pastNewest.length}
                      </summary>
                      <div className="divide-y divide-line border-t border-line">
                        {pastNewest.slice(PAST_SHOWN).map((trip) => (
                          <TripRow
                            key={trip.id}
                            id={trip.id}
                            coverPath={trip.cover_path}
                            coverPosition={trip.cover_position}
                            href={`/trips/${trip.id}/overview`}
                            name={trip.name}
                            destination={trip.destination}
                            dates={formatDateRange(trip.start_date, trip.end_date)}
                          />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </section>
            )}
          </Column>
        </div>
      )}
    </>
  );
}

function names(trip: MyTrip) {
  return (trip.travellers || []).map((t) => t.display_name);
}

/** Each trip's own "today" (destination date, from getMyTrips) — same as Overview. */
function tripToday(trip: MyTrip) {
  return trip.today ? parseISO(trip.today) : new Date();
}

/** "Day X of Y" — same maths as before the redesign. */
function dayOfTrip(trip: MyTrip) {
  const today = tripToday(trip);
  const start = parseISO(trip.start_date);
  const end = parseISO(trip.end_date);
  const currentDay = differenceInCalendarDays(today, start) + 1;
  const totalDays = differenceInCalendarDays(end, start) + 1;
  return `Day ${currentDay} of ${totalDays}`;
}

/** "In N days" — same maths as the old "N days to go". */
function countdown(trip: MyTrip) {
  const daysUntil = differenceInCalendarDays(parseISO(trip.start_date), tripToday(trip));
  return daysUntil === 1 ? "In 1 day" : `In ${daysUntil} days`;
}
