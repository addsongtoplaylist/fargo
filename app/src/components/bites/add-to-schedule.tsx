"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { createActivity } from "@/lib/actions/activity";
import { suggestPlaceIdea } from "@/lib/actions/idea";
import { useToast } from "@/components/toast";
import type { DiningSpot } from "@/lib/actions/bites";
import { placeIdea, type DiscoverTrip } from "@/components/bites/discover-trips";
import { ACTIVITY_CATEGORIES } from "@/lib/categories";
import { todayForCountry } from "@/lib/dates";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FieldRow, fieldClass } from "@/components/ui/field";
import { CategorySelect } from "@/components/ui/category-select";
import {
  eachDayOfInterval,
  parseISO,
  format,
} from "date-fns";

type AddToScheduleProps = {
  spot: DiningSpot;
  /** First one is the default — the ongoing trip from home */
  trips: DiscoverTrip[];
  onClose: () => void;
  onDone: () => void;
};

function daysOf(trip: DiscoverTrip | undefined) {
  if (!trip) return [];
  return eachDayOfInterval({ start: parseISO(trip.start_date), end: parseISO(trip.end_date) }).map((date, i) => ({
    date: format(date, "yyyy-MM-dd"),
    label: `Day ${i + 1} · ${format(date, "EEE d MMM")}`,
  }));
}

/** Today at the trip's destination if it's a trip day, else the first day */
function defaultDay(trip: DiscoverTrip | undefined) {
  const days = daysOf(trip);
  const today = todayForCountry(trip?.countryCode);
  return days.find((d) => d.date === today)?.date ?? days[0]?.date ?? "";
}

export function AddToSchedule({
  spot,
  trips,
  onClose,
  onDone,
}: AddToScheduleProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const trip = trips.find((t) => t.id === tripId);
  const tripDays = useMemo(() => daysOf(trip), [trip]);

  const [selectedDay, setSelectedDay] = useState(() => defaultDay(trips[0]));
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [category, setCategory] = useState("food");
  // On a trip you don't plan, the place goes in as an idea for the planner
  const suggest = trip ? !trip.isPlanner : false;

  function changeTrip(id: string) {
    setTripId(id);
    setSelectedDay(defaultDay(trips.find((t) => t.id === id)));
  }

  async function handleAdd() {
    setSaving(true);
    try {
      if (suggest) {
        await suggestPlaceIdea(tripId, placeIdea(spot));
        toast("Suggested — it's in Prep → Ideas", "success");
      } else {
        await createActivity(tripId, {
          date: selectedDay,
          time: selectedTime,
          title: spot.name,
          notes: `${spot.cuisine} · ${spot.priceTier} · ${spot.address}`,
          category,
          place_name: spot.name,
          place_lat: String(spot.lat),
          place_lng: String(spot.lng),
        });
        toast(trips.length > 1 && trip ? `Added to ${trip.name}` : "Added to schedule", "success");
      }
      onDone();
    } catch (err) {
      console.error("Failed to add activity:", err);
      toast(suggest ? "Couldn't suggest this place. Please try again." : "Failed to add to schedule", "error");
      setSaving(false);
    }
  }

  const selectedDayLabel =
    tripDays.find((d) => d.date === selectedDay)?.label ?? selectedDay;
  const [hh, mm] = selectedTime.split(":");
  const selectClass = `${fieldClass} w-[76px] px-2.5`;

  return (
    <Sheet
      open
      title={trips.length > 1 ? "Add to a trip" : "Add to schedule"}
      onClose={onClose}
      footer={
        <Button size="lg" full onClick={handleAdd} disabled={saving || !tripId || (!suggest && !selectedDay)}>
          {saving && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {suggest ? "Suggest as idea" : `Add to ${selectedDayLabel?.split(" · ")[0] ?? "schedule"}`}
        </Button>
      }
    >
      <div className="space-y-3 pb-1">
        {/* Spot summary */}
        <div className="bg-page rounded-field px-3.5 py-3">
          <p className="text-[15px] font-semibold text-fg">{spot.name}</p>
          <p className="text-[13px] text-fg-muted mt-0.5">
            {spot.cuisine} · {spot.priceTier}
          </p>
        </div>

        {/* Trip — only when there's a choice (Discover from home) */}
        {trips.length > 1 && (
          <FieldRow label="Trip" htmlFor="ats-trip">
            <select id="ats-trip" value={tripId} onChange={(e) => changeTrip(e.target.value)} className={fieldClass}>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FieldRow>
        )}

        {suggest ? (
          <p className="text-[13px] text-fg-muted px-1">
            The planner decides what goes on this trip&apos;s schedule — it&apos;ll go to Prep → Ideas for them.
          </p>
        ) : (
          <>
            {/* Day */}
            <FieldRow label="Day" htmlFor="ats-day">
              <select id="ats-day" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className={fieldClass}>
                {tripDays.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FieldRow>

            {/* Time — HH : MM dropdowns (15-min intervals), same as Add activity */}
            <FieldRow label="Time" htmlFor="ats-hh">
              <select
                id="ats-hh"
                aria-label="Hour"
                value={hh}
                onChange={(e) => setSelectedTime(`${e.target.value}:${mm || "00"}`)}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-sm text-fg-muted">:</span>
              <select
                aria-label="Minutes"
                value={mm || "00"}
                onChange={(e) => setSelectedTime(`${hh || "12"}:${e.target.value}`)}
                className={selectClass}
              >
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </FieldRow>

            {/* Category — same dropdown as Add activity */}
            <CategorySelect id="ats-category" value={category} options={ACTIVITY_CATEGORIES} onChange={setCategory} />
          </>
        )}
      </div>
    </Sheet>
  );
}
