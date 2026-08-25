import Link from "next/link";
import { Column } from "@/components/column";
import { getActivities } from "@/lib/actions/activity";
import { getTrip, getMyRole } from "@/lib/actions/trip";
import { OverviewPeople } from "@/components/people/overview-people";
import { CATEGORY_EMOJI } from "@/lib/categories";
import {
  format,
  parseISO,
  isAfter,
  isBefore,
} from "date-fns";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [activities, trip, myRole] = await Promise.all([
    getActivities(id),
    getTrip(id),
    getMyRole(id),
  ]);

  if (!trip) notFound();

  const now = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const tripEnded = isAfter(now, endDate);
  const tripStarted = !isBefore(now, startDate);
  const isActive = tripStarted && !tripEnded;

  // Today's activities (for active trips)
  const todayStr = format(now, "yyyy-MM-dd");
  const todayActivities = isActive
    ? activities
        .filter((a) => a.date === todayStr)
        .sort((a, b) => {
          if (!a.time && !b.time) return a.sort_order - b.sort_order;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        })
    : [];

  // Find next upcoming activity (with time >= now)
  const nowTime = format(now, "HH:mm");
  const nextIdx = todayActivities.findIndex(
    (a) => !a.time || a.time >= nowTime
  );

  return (
    <Column className="py-4 pb-8 space-y-4">
      {/* Today's plan — active trips only */}
      {isActive && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">Today's plan</p>
            <Link
              href={`/trips/${id}/schedule`}
              className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
            >
              View schedule →
            </Link>
          </div>

          {todayActivities.length === 0 ? (
            <p className="text-sm text-muted py-2">
              Nothing planned for today.
            </p>
          ) : (
            <div className="space-y-2">
              {todayActivities.slice(0, 3).map((activity, i) => {
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
                        Next
                      </span>
                    )}
                  </div>
                );
              })}
              {todayActivities.length > 3 && (
                <Link
                  href={`/trips/${id}/schedule`}
                  className="block text-center text-xs text-muted hover:text-accent py-1 transition-colors"
                >
                  +{todayActivities.length - 3} more
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upcoming trips — show a prompt to check the schedule */}
      {!isActive && !tripEnded && (
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-ink mb-1">
            {activities.length > 0
              ? `${activities.length} activities planned`
              : "No activities yet"}
          </p>
          <Link
            href={`/trips/${id}/schedule`}
            className="text-xs text-accent font-medium hover:text-accent-hover transition-colors"
          >
            {activities.length > 0 ? "View schedule →" : "Start planning →"}
          </Link>
        </div>
      )}

      {/* People section */}
      <OverviewPeople
        tripId={trip.id}
        travellers={trip.travellers ?? []}
        plannerId={trip.planner_id}
        isPlanner={myRole === "planner"}
      />
    </Column>
  );
}
