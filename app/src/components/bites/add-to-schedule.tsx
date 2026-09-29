"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { createActivity } from "@/lib/actions/activity";
import { useToast } from "@/components/toast";
import type { DiningSpot } from "@/lib/actions/bites";
import { ACTIVITY_CATEGORIES } from "@/lib/categories";
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
  tripId: string;
  localCurrency: string;
  onClose: () => void;
  onDone: () => void;
};

export function AddToSchedule({
  spot,
  tripId,
  onClose,
  onDone,
}: AddToScheduleProps) {
  const trip = useTrip();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Generate trip days
  const tripDays = useMemo(() => {
    if (!trip) return [];
    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    return eachDayOfInterval({ start, end }).map((date, i) => ({
      date: format(date, "yyyy-MM-dd"),
      label: `Day ${i + 1} · ${format(date, "EEE d MMM")}`,
    }));
  }, [trip]);

  // Default to today's trip day, or the first day
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultDay = tripDays.find((d) => d.date === todayStr)?.date ?? tripDays[0]?.date ?? "";

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [category, setCategory] = useState("food");

  async function handleAdd() {
    setSaving(true);
    try {
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
      toast("Added to schedule", "success");
      onDone();
    } catch (err) {
      console.error("Failed to add activity:", err);
      toast("Failed to add to schedule", "error");
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
      title="Add to schedule"
      onClose={onClose}
      footer={
        <Button size="lg" full onClick={handleAdd} disabled={saving || !selectedDay}>
          {saving && <Loader2 size={16} className="animate-spin" aria-hidden />}
          Add to {selectedDayLabel?.split(" · ")[0] ?? "schedule"}
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
      </div>
    </Sheet>
  );
}
