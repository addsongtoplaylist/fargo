"use client";

import { useState, useMemo } from "react";
import { X, Loader2, UtensilsCrossed } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { createActivity } from "@/lib/actions/activity";
import { useToast } from "@/components/toast";
import type { DiningSpot } from "@/lib/actions/bites";
import {
  eachDayOfInterval,
  parseISO,
  format,
  differenceInCalendarDays,
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
  localCurrency,
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
      label: `Day ${i + 1} — ${format(date, "MMM d")}`,
    }));
  }, [trip]);

  // Default to today's trip day, or the first day
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultDay = tripDays.find((d) => d.date === todayStr)?.date ?? tripDays[0]?.date ?? "";

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [selectedTime, setSelectedTime] = useState("12:00");

  async function handleAdd() {
    setSaving(true);
    try {
      await createActivity(tripId, {
        date: selectedDay,
        time: selectedTime,
        title: spot.name,
        notes: `${spot.cuisine} · ${spot.priceTier} · ${spot.address}`,
        category: "food",
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-[var(--max-width-column)] bg-card rounded-t-2xl border-t border-border px-4 pt-3 pb-20">
        {/* Handle */}
        <div className="w-8 h-1 bg-border rounded-full mx-auto mb-4" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-muted hover:text-ink"
        >
          <X size={18} />
        </button>

        <h3 className="text-sm font-semibold text-ink mb-4">Add to schedule</h3>

        {/* Spot summary */}
        <div className="bg-ground rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-ink">{spot.name}</p>
          <p className="text-xs text-muted mt-0.5">
            {spot.cuisine} · {spot.priceTier}
          </p>
        </div>

        {/* Day picker */}
        <div className="flex items-center justify-between py-2.5 border-b border-border">
          <span className="text-sm text-muted">Day</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="text-sm font-medium text-ink bg-ground border border-border rounded-md px-2 py-1 outline-none focus:border-accent transition-colors"
          >
            {tripDays.map((d) => (
              <option key={d.date} value={d.date}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time picker */}
        <div className="flex items-center justify-between py-2.5 border-b border-border">
          <span className="text-sm text-muted">Time</span>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="text-sm font-medium text-ink bg-ground border border-border rounded-md px-2 py-1 outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Category */}
        <div className="flex items-center justify-between py-2.5 border-b border-border">
          <span className="text-sm text-muted">Category</span>
          <span className="text-sm font-medium text-ink flex items-center gap-1">
            <UtensilsCrossed size={12} />
            Food
          </span>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={saving || !selectedDay}
          className="w-full mt-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : null}
          Add to {selectedDayLabel?.split(" — ")[0] ?? "schedule"}
        </button>
      </div>
    </div>
  );
}
