import Link from "next/link";
import { Column } from "@/components/column";
import { getActivities } from "@/lib/actions/activity";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { OverviewPeople } from "@/components/people/overview-people";
import { OverviewHeader } from "@/components/overview-header";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  format,
  parseISO,
  addDays,
  differenceInDays,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isTomorrow,
} from "date-fns";
import { notFound } from "next/navigation";
import { Clock, Thermometer, CalendarDays, Compass, Landmark, BedDouble } from "lucide-react";
import { getCurrentTemperature, weatherLocation } from "@/lib/weather";
import { COUNTRY_TIMEZONE, todayForCountry } from "@/lib/dates";

const HOME_TIMEZONE = "Asia/Kuala_Lumpur";

function getLocalTime(timezone: string): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [activities, trip, account] = await Promise.all([
    getActivities(id),
    getTrip(id),
    getOrCreateAccount(),
  ]);

  if (!trip) notFound();

  // Derive role from trip.travellers — no separate query needed
  // (getTrip already fetches travellers(*) and is deduped with layout via React cache)
  const myRole = trip.travellers?.find(
    (t: { account_id: string; role: string }) => t.account_id === account?.id
  )?.role;

  const now = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const tripEnded = isAfter(now, endDate);
  const tripStarted = !isBefore(now, startDate);
  const isActive = tripStarted && !tripEnded;

  // Find today's plan: only timed activities, max 3 (Now + 2 upcoming).
  // "Now" = the activity whose time has passed but the next one hasn't started.
  // An activity "owns" the gap until the next timed activity begins.
  const todayStr = format(now, "yyyy-MM-dd");
  const nowTime = format(now, "HH:mm");
  let displayActivities: (typeof activities[number] & { tag: "now" | "upcoming" })[] = [];
  let upcomingLabel = "Today's plan";

  if (isActive) {
    // Get timed activities for today, sorted by time
    const todayTimed = activities
      .filter((a) => a.date === todayStr && a.time)
      .sort((a, b) => a.time!.localeCompare(b.time!));

    if (todayTimed.length > 0) {
      // Find the "Now" activity: last activity whose time <= now
      let nowIdx = -1;
      for (let i = todayTimed.length - 1; i >= 0; i--) {
        if (todayTimed[i].time! <= nowTime) {
          nowIdx = i;
          break;
        }
      }

      if (nowIdx >= 0) {
        // We have a "Now" activity — show it + up to 2 upcoming
        displayActivities = [
          { ...todayTimed[nowIdx], tag: "now" as const },
          ...todayTimed.slice(nowIdx + 1, nowIdx + 3).map((a) => ({ ...a, tag: "upcoming" as const })),
        ];
      } else {
        // All activities are in the future — show first 3 as upcoming
        displayActivities = todayTimed
          .slice(0, 3)
          .map((a) => ({ ...a, tag: "upcoming" as const }));
      }
    }

    // If no timed activities today, try tomorrow then day after
    if (displayActivities.length === 0) {
      for (let offset = 1; offset <= 2; offset++) {
        const dateStr = format(addDays(now, offset), "yyyy-MM-dd");
        const dayTimed = activities
          .filter((a) => a.date === dateStr && a.time)
          .sort((a, b) => a.time!.localeCompare(b.time!));

        if (dayTimed.length > 0) {
          displayActivities = dayTimed
            .slice(0, 3)
            .map((a) => ({ ...a, tag: "upcoming" as const }));

          const dateObj = parseISO(dateStr);
          if (isTomorrow(dateObj)) {
            upcomingLabel = "Tomorrow's plan";
          } else {
            upcomingLabel = format(dateObj, "EEEE, d MMM");
          }
          break;
        }
      }
    }
  }

  // Local time/weather
  const countryCode = trip.destination_country_code;
  const localTz = countryCode ? COUNTRY_TIMEZONE[countryCode] : null;
  const localTime = localTz ? getLocalTime(localTz) : null;
  const homeTime = getLocalTime(HOME_TIMEZONE);
  const isSameTimezone = localTz === HOME_TIMEZONE;
  // Weather follows the current Stay, falling back to the base city
  const weatherAt = tripEnded
    ? null
    : weatherLocation(
        activities,
        { lat: trip.base_lat, lng: trip.base_lng },
        todayForCountry(countryCode),
        tripStarted
      );
  const temperature = weatherAt ? await getCurrentTemperature(weatherAt.lat, weatherAt.lng) : null;

  // Header subline: dates · Day X of Y / In N days / Trip ended
  const dateRange = `${format(startDate, "d MMM")} – ${format(endDate, "d MMM yyyy")}`;
  const tripDays = differenceInDays(endDate, startDate) + 1;
  const state = tripEnded
    ? "Trip ended"
    : isActive
      ? `Day ${differenceInCalendarDays(now, startDate) + 1} of ${tripDays}`
      : (() => {
          const n = differenceInCalendarDays(startDate, now);
          return n === 1 ? "In 1 day" : `In ${n} days`;
        })();

  const role = myRole === "planner" ? "planner" : myRole ? "member" : undefined;
  const scheduleLink = (text: string) => (
    <Link href={`/trips/${id}/schedule`} className="text-[13px] font-medium text-brand hover:text-brand-hover">
      {text}
    </Link>
  );

  return (
    <>
      <OverviewHeader tripId={trip.id} name={trip.name} destination={trip.destination} subline={`${dateRange} · ${state}`} role={role} coverPath={trip.cover_path} coverPosition={trip.cover_position} />

      <Column className="pt-4 space-y-3">
        {/* Local time & temperature — before/during the trip, when the country is known */}
        {!tripEnded && localTime && (
          <div className="bg-surface rounded-card px-4 py-3.5 flex items-center">
            <div className="flex-1 flex items-center gap-2.5">
              <Clock size={20} strokeWidth={1.8} className="text-fg-muted" aria-hidden />
              <div>
                <p className="text-lg font-semibold tabular-nums text-fg">{localTime}</p>
                <p className="text-[11px] text-fg-muted">{isSameTimezone ? "Local" : `Local · home ${homeTime}`}</p>
              </div>
            </div>
            {temperature !== null && (
              <>
                <div className="w-px h-9 bg-line mx-3.5" aria-hidden />
                <div className="flex-1 flex items-center gap-2.5">
                  <Thermometer size={20} strokeWidth={1.8} className="text-fg-muted" aria-hidden />
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-fg">{temperature}°C</p>
                    <p className="text-[11px] text-fg-muted">Right now</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* During the trip — Today's / Tomorrow's plan */}
        {isActive && (
          <div className="bg-surface rounded-card px-4 pt-3.5 pb-1.5">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-base font-semibold text-fg">{upcomingLabel}</h2>
              {scheduleLink("Schedule")}
            </div>
            {displayActivities.length === 0 ? (
              <p className="text-sm text-fg-muted py-3">No upcoming activities planned.</p>
            ) : (
              <div className="divide-y divide-line">
                {displayActivities.map((activity) => {
                  const isNow = activity.tag === "now";
                  return (
                    <div key={activity.id} className="flex items-center gap-3 py-2.5">
                      <span className={`w-11 shrink-0 text-[13px] tabular-nums ${isNow ? "font-semibold text-brand" : "font-medium text-fg-muted"}`}>
                        {activity.time}
                      </span>
                      <CategoryIcon category={activity.category} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-fg truncate">{activity.title}</p>
                        {activity.place_name && <p className="text-xs text-fg-muted truncate mt-px">{activity.place_name}</p>}
                      </div>
                      {isNow && (
                        <span className="text-[10px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-full shrink-0">NOW</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Before the trip — first 3 soonest activities */}
        {!isActive && !tripEnded && (
          <div className="bg-surface rounded-card px-4 pt-3.5 pb-1.5">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-base font-semibold text-fg">
                {activities.length > 0
                  ? `${activities.length} ${activities.length === 1 ? "activity" : "activities"} planned`
                  : "No activities yet"}
              </h2>
              {scheduleLink(activities.length > 0 ? "View schedule" : "Start planning")}
            </div>

            {activities.length > 0 &&
              (() => {
                const sorted = [...activities].sort((a, b) => {
                  const dateCmp = a.date.localeCompare(b.date);
                  if (dateCmp !== 0) return dateCmp;
                  if (!a.time && !b.time) return a.sort_order - b.sort_order;
                  if (!a.time) return 1;
                  if (!b.time) return -1;
                  return a.time.localeCompare(b.time);
                });
                return (
                  <>
                    <div className="divide-y divide-line">
                      {sorted.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 py-2.5">
                          <span className="w-11 shrink-0 text-[13px] font-medium tabular-nums text-fg-muted">{activity.time ?? ""}</span>
                          <CategoryIcon category={activity.category} size={32} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-fg truncate">{activity.title}</p>
                            <p className="text-xs text-fg-muted truncate mt-px">
                              {format(parseISO(activity.date), "d MMM")}
                              {activity.place_name && <> · {activity.place_name}</>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {activities.length > 3 && (
                      <Link href={`/trips/${id}/schedule`} className="block text-center text-[13px] text-fg-muted hover:text-brand py-2">
                        +{activities.length - 3} more
                      </Link>
                    )}
                  </>
                );
              })()}
          </div>
        )}

        {/* After the trip — summary */}
        {tripEnded &&
          (() => {
            const accommodations = activities.filter((a) => a.category === "accommodation");
            // Attractions visited — only "activities" category
            const attractions = activities
              .filter((a) => a.category === "activities")
              .map((a) => a.title)
              .filter((t, i, arr) => arr.indexOf(t) === i); // unique
            const eyebrow = "text-[11px] font-semibold tracking-[0.6px] uppercase text-fg-muted";

            return (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between px-1">
                  <h2 className="text-base font-semibold text-fg">Trip summary</h2>
                  {scheduleLink("View schedule")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-card px-4 py-3.5">
                    <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                      <CalendarDays size={14} className="text-brand" aria-hidden /> Duration
                    </p>
                    <p className="text-lg font-bold text-fg mt-2">{tripDays} days</p>
                    <p className="text-xs text-fg-muted mt-0.5">{dateRange}</p>
                  </div>
                  <div className="bg-surface rounded-card px-4 py-3.5">
                    <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                      <Compass size={14} className="text-brand" aria-hidden /> Destination
                    </p>
                    <p className="text-lg font-bold text-fg mt-2">{trip.destination}</p>
                  </div>
                </div>
                {attractions.length > 0 && (
                  <div className="bg-surface rounded-card px-4 py-3.5">
                    <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                      <Landmark size={14} className="text-brand" aria-hidden /> Activities
                    </p>
                    <ol className="mt-2.5 pl-5 list-decimal text-sm text-fg space-y-1">
                      {attractions.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {accommodations.length > 0 && (
                  <div className="bg-surface rounded-card px-4 py-3.5">
                    <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                      <BedDouble size={14} className="text-brand" aria-hidden /> Stay
                    </p>
                    <div className="mt-2.5 space-y-1">
                      {[...new Set(accommodations.map((a) => a.place_name || a.title))].map((name) => (
                        <p key={name} className="text-sm font-medium text-fg">
                          {name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* People section */}
        <OverviewPeople
          tripId={trip.id}
          travellers={trip.travellers ?? []}
          plannerId={trip.planner_id}
          isPlanner={myRole === "planner"}
          myAccountId={account?.id ?? ""}
        />
      </Column>
    </>
  );
}
