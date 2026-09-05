import Link from "next/link";
import { Column } from "@/components/column";
import { getActivities } from "@/lib/actions/activity";
import { getTrip, getMyRole } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { OverviewPeople } from "@/components/people/overview-people";
import { CATEGORY_EMOJI } from "@/lib/categories";
import {
  format,
  parseISO,
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
} from "date-fns";
import { notFound } from "next/navigation";
import { MapPin, Clock, CloudSun, CalendarDays, Compass, Building2 } from "lucide-react";

/** Map country code → IANA timezone (common destinations). */
const COUNTRY_TIMEZONE: Record<string, string> = {
  US: "America/New_York",
  GB: "Europe/London",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  CN: "Asia/Shanghai",
  TW: "Asia/Taipei",
  HK: "Asia/Hong_Kong",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  VN: "Asia/Ho_Chi_Minh",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  IN: "Asia/Kolkata",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  CA: "America/Toronto",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  NL: "Europe/Amsterdam",
  CH: "Europe/Zurich",
  AE: "Asia/Dubai",
  TR: "Europe/Istanbul",
  BR: "America/Sao_Paulo",
  MX: "America/Mexico_City",
  PT: "Europe/Lisbon",
  AT: "Europe/Vienna",
  BE: "Europe/Brussels",
  IE: "Europe/Dublin",
  FI: "Europe/Helsinki",
  GR: "Europe/Athens",
};

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
  const [activities, trip, myRole, account] = await Promise.all([
    getActivities(id),
    getTrip(id),
    getMyRole(id),
    getOrCreateAccount(),
  ]);

  if (!trip) notFound();

  const now = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const tripEnded = isAfter(now, endDate);
  const tripStarted = !isBefore(now, startDate);
  const isActive = tripStarted && !tripEnded;

  // Find upcoming activities: today first, then tomorrow, then day after
  const todayStr = format(now, "yyyy-MM-dd");
  let upcomingActivities: typeof activities = [];
  let upcomingLabel = "Today's plan";
  let upcomingDate = todayStr;

  if (isActive) {
    for (let offset = 0; offset <= 2; offset++) {
      const dateStr = format(addDays(now, offset), "yyyy-MM-dd");
      const dayActivities = activities
        .filter((a) => a.date === dateStr)
        .sort((a, b) => {
          if (!a.time && !b.time) return a.sort_order - b.sort_order;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });

      if (dayActivities.length > 0) {
        upcomingActivities = dayActivities;
        upcomingDate = dateStr;

        const dateObj = parseISO(dateStr);
        if (isToday(dateObj)) {
          upcomingLabel = "Today's plan";
        } else if (isTomorrow(dateObj)) {
          upcomingLabel = "Tomorrow's plan";
        } else {
          upcomingLabel = format(dateObj, "EEEE, d MMM");
        }
        break;
      }
    }
  }

  // Find next upcoming activity (with time >= now) — only for today
  const nowTime = format(now, "HH:mm");
  let nextIdx: number;
  let nextLabel = "Next";

  if (upcomingDate === todayStr) {
    // Find first activity whose time hasn't passed yet
    const futureIdx = upcomingActivities.findIndex(
      (a) => !a.time || a.time >= nowTime
    );
    if (futureIdx >= 0) {
      nextIdx = futureIdx;
    } else {
      // All activities have passed — show the last one as "Latest"
      nextIdx = upcomingActivities.length - 1;
      nextLabel = "Latest";
    }
  } else {
    // Future day — highlight the first one
    nextIdx = 0;
  }

  // Local time/weather
  const countryCode = trip.destination_country_code;
  const localTz = countryCode ? COUNTRY_TIMEZONE[countryCode] : null;
  const localTime = localTz ? getLocalTime(localTz) : null;
  const homeTime = getLocalTime(HOME_TIMEZONE);
  const isSameTimezone = localTz === HOME_TIMEZONE;

  return (
    <Column className="py-4 pb-8 space-y-4">
      {/* Local time & weather — active + upcoming trips with destination set */}
      {!tripEnded && localTime && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={13} className="text-accent shrink-0" />
            <span className="text-sm font-medium text-ink">
              {trip.destination}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-muted" />
                <span className="text-sm tabular-nums text-ink font-medium">
                  {localTime}
                </span>
                <span className="text-[10px] text-muted">local</span>
              </div>
              {!isSameTimezone && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm tabular-nums text-muted">
                    {homeTime}
                  </span>
                  <span className="text-[10px] text-muted">home</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <CloudSun size={16} className="text-amber-500" />
              <span className="text-sm text-ink">32°C</span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming plan — active trips */}
      {isActive && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">{upcomingLabel}</p>
            <Link
              href={`/trips/${id}/schedule`}
              className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
            >
              View schedule →
            </Link>
          </div>

          {upcomingActivities.length === 0 ? (
            <p className="text-sm text-muted py-2">
              No upcoming activities in the next few days.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingActivities.slice(0, 3).map((activity, i) => {
                const isNext = i === nextIdx;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 rounded-md px-2.5 py-2 ${
                      isNext
                        ? "bg-accent/10 border border-accent/20"
                        : "bg-ground"
                    }`}
                  >
                    {/* Time */}
                    <div className="w-12 shrink-0 pt-0.5">
                      {activity.time ? (
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            isNext ? "text-accent" : "text-muted"
                          }`}
                        >
                          {activity.time}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {CATEGORY_EMOJI[activity.category] ?? "📦"}
                        </span>
                        <span
                          className={`text-sm truncate ${
                            isNext
                              ? "font-semibold text-ink"
                              : "font-medium text-ink"
                          }`}
                        >
                          {activity.title}
                        </span>
                      </div>
                      {activity.place_name && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin
                            size={10}
                            className="text-muted/60 shrink-0"
                          />
                          <span className="text-[11px] text-muted truncate">
                            {activity.place_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* "Next" label */}
                    {isNext && (
                      <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                        {nextLabel}
                      </span>
                    )}
                  </div>
                );
              })}
              {upcomingActivities.length > 3 && (
                <Link
                  href={`/trips/${id}/schedule`}
                  className="block text-center text-xs text-muted hover:text-accent py-1 transition-colors"
                >
                  +{upcomingActivities.length - 3} more
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upcoming trips (not started yet) — show first 3 soonest activities */}
      {!isActive && !tripEnded && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">
              {activities.length > 0
                ? `${activities.length} ${activities.length === 1 ? "activity" : "activities"} planned`
                : "No activities yet"}
            </p>
            <Link
              href={`/trips/${id}/schedule`}
              className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
            >
              {activities.length > 0 ? "View schedule →" : "Start planning →"}
            </Link>
          </div>

          {activities.length > 0 && (() => {
            const sorted = [...activities].sort((a, b) => {
              const dateCmp = a.date.localeCompare(b.date);
              if (dateCmp !== 0) return dateCmp;
              if (!a.time && !b.time) return a.sort_order - b.sort_order;
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            });
            const first3 = sorted.slice(0, 3);
            return (
              <div className="space-y-2">
                {first3.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-md px-2.5 py-2 bg-ground"
                  >
                    <div className="w-12 shrink-0 pt-0.5">
                      {activity.time ? (
                        <span className="text-xs font-medium tabular-nums text-muted">
                          {activity.time}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {CATEGORY_EMOJI[activity.category] ?? "📦"}
                        </span>
                        <span className="text-sm font-medium text-ink truncate">
                          {activity.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">
                        {format(parseISO(activity.date), "d MMM")}
                        {activity.place_name && (
                          <> · {activity.place_name}</>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length > 3 && (
                  <Link
                    href={`/trips/${id}/schedule`}
                    className="block text-center text-xs text-muted hover:text-accent py-1 transition-colors"
                  >
                    +{activities.length - 3} more
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Post-trip summary — ended trips (dashboard layout) */}
      {tripEnded && (() => {
        const tripDays = differenceInDays(endDate, startDate) + 1;
        const accommodations = activities.filter(
          (a) => a.category === "accommodation"
        );
        const dateRange = `${format(startDate, "d MMM")} – ${format(endDate, "d MMM yyyy")}`;

        // Attractions visited — only "activities" category
        const attractions = activities
          .filter((a) => a.category === "activities")
          .map((a) => a.title)
          .filter((t, i, arr) => arr.indexOf(t) === i); // unique

        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Trip summary</p>
              <Link
                href={`/trips/${id}/schedule`}
                className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
              >
                View schedule →
              </Link>
            </div>

            {/* Dashboard grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Duration */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarDays size={13} className="text-accent" />
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wide">Duration</span>
                </div>
                <p className="text-lg font-semibold text-ink">{tripDays} days</p>
                <p className="text-[11px] text-muted mt-0.5">{dateRange}</p>
              </div>

              {/* Destination */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={13} className="text-accent" />
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wide">Destination</span>
                </div>
                <p className="text-lg font-semibold text-ink">{trip.destination}</p>
              </div>

              {/* Activities — attractions visited */}
              {attractions.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-4" style={{ gridColumn: "1 / -1" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Compass size={13} className="text-accent" />
                    <span className="text-[10px] font-medium text-muted uppercase tracking-wide">
                      Activities
                    </span>
                  </div>
                  <ol className="space-y-1" style={{ listStyleType: "decimal", listStylePosition: "inside" }}>
                    {attractions.map((name) => (
                      <li key={name} className="text-sm text-ink">
                        {name}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Hotel — full width, only if accommodations exist */}
              {accommodations.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-4" style={{ gridColumn: "1 / -1" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 size={13} className="text-accent" />
                    <span className="text-[10px] font-medium text-muted uppercase tracking-wide">Stay</span>
                  </div>
                  <div className="space-y-1">
                    {accommodations.map((a) => (
                      <p key={a.id} className="text-sm font-medium text-ink">
                        🏨 {a.place_name || a.title}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
  );
}
