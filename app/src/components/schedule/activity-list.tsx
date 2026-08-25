"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useTrip } from "@/lib/trip-context";
import { reorderActivities } from "@/lib/actions/activity";
import { DayPicker } from "./day-picker";
import { ActivityCard } from "./activity-card";
import { AddActivityPanel } from "./add-activity-panel";
import { BudgetStrip } from "./budget-strip";
import { DayMap } from "./day-map";
import type { Activity } from "@/lib/actions/activity";

type ActivityListProps = {
  activities: Activity[];
  dailyFree: number;
  spendingByDate: Record<string, number>;
};

export function ActivityList({
  activities: initialActivities,
  dailyFree,
  spendingByDate,
}: ActivityListProps) {
  const trip = useTrip();
  const router = useRouter();
  if (!trip) return null;

  const isPlanner = trip.myRole === "planner";
  const today = format(new Date(), "yyyy-MM-dd");

  // Default to today if within trip dates, otherwise trip start
  const defaultDate =
    trip.status === "active" && today >= trip.start_date && today <= trip.end_date
      ? today
      : trip.start_date;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  // Local state for optimistic reorder
  const [activities, setActivities] = useState(initialActivities);

  // Sync when server data changes (e.g. after add/edit/delete)
  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  // Filter activities for the selected day
  const dayActivities = useMemo(
    () => activities.filter((a) => a.date === selectedDate),
    [activities, selectedDate]
  );

  // Sensors: pointer with activation distance to distinguish click from drag,
  // plus touch sensor for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = dayActivities.findIndex((a) => a.id === active.id);
      const newIndex = dayActivities.findIndex((a) => a.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Optimistic update
      const reordered = arrayMove(dayActivities, oldIndex, newIndex);
      setActivities((prev) => {
        const otherDays = prev.filter((a) => a.date !== selectedDate);
        return [...otherDays, ...reordered];
      });

      // Persist to server
      const orderedIds = reordered.map((a) => a.id);
      await reorderActivities(trip.id, orderedIds);
    },
    [dayActivities, selectedDate, trip.id]
  );

  // "You are here" — next upcoming activity for active trips
  const youAreHereId = useMemo(() => {
    if (trip.status !== "active" || selectedDate !== today) return null;

    const now = format(new Date(), "HH:mm");
    const upcoming = dayActivities.find((a) => {
      if (!a.time) return true;
      return a.time >= now;
    });
    return upcoming?.id ?? null;
  }, [trip.status, selectedDate, today, dayActivities]);

  function handleEdit(activity: Activity) {
    setEditing(activity);
    setPanelOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setPanelOpen(true);
  }

  function handlePanelClose() {
    setPanelOpen(false);
    setEditing(null);
    // BUG-1 fix: revalidatePath alone doesn't refresh the client Router Cache.
    // Calling router.refresh() forces the RSC payload to re-fetch.
    router.refresh();
  }

  // Format the selected date for the header
  const selectedDateObj = parseISO(selectedDate);
  const dayLabel = isToday(selectedDateObj)
    ? "Today"
    : format(selectedDateObj, "EEEE, d MMM");

  return (
    <div>
      {/* Day picker */}
      <DayPicker
        startDate={trip.start_date}
        endDate={trip.end_date}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        tripStatus={trip.status}
      />

      {/* Daily budget strip — shows when budget is set */}
      {dailyFree > 0 && (
        <div className="pt-2">
          <BudgetStrip
            dailyFree={dailyFree}
            spentToday={Math.round((spendingByDate[selectedDate] ?? 0) * 100) / 100}
          />
        </div>
      )}

      {/* Day header */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-sm font-semibold text-ink">{dayLabel}</h3>
      </div>

      {/* Day map — shows pins for activities with locations */}
      <div className="px-4 pb-2">
        <DayMap activities={dayActivities} />
      </div>

      {/* Activity cards with drag-and-drop */}
      <div className="px-4 space-y-2">
        {dayActivities.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">
            {isPlanner ? "No activities yet. Tap below to add one." : "No activities planned for this day."}
          </p>
        ) : isPlanner ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dayActivities.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {dayActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isYouAreHere={activity.id === youAreHereId}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-2">
            {dayActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isYouAreHere={activity.id === youAreHereId}
                onEdit={() => {}} // read-only — no edit panel
              />
            ))}
          </div>
        )}

        {/* Add activity button — planner only */}
        {isPlanner && (
          <button
            onClick={handleAdd}
            className="w-full py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium text-accent border border-dashed border-accent/40 rounded-lg hover:bg-accent-soft transition-colors"
          >
            <Plus size={15} />
            Add activity
          </button>
        )}
      </div>

      {/* Add/Edit panel */}
      {panelOpen && (
        <AddActivityPanel
          tripId={trip.id}
          date={selectedDate}
          editing={editing}
          onClose={handlePanelClose}
          proximity={
            // Prefer trip destination coords, fall back to first geolocated activity
            trip.destination_lat && trip.destination_lng
              ? { lat: trip.destination_lat, lng: trip.destination_lng }
              : activities.find((a) => a.place_lat && a.place_lng)
                ? {
                    lat: parseFloat(activities.find((a) => a.place_lat)!.place_lat!),
                    lng: parseFloat(activities.find((a) => a.place_lng)!.place_lng!),
                  }
                : undefined
          }
        />
      )}
    </div>
  );
}
