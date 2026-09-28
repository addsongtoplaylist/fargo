"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDownToLine } from "lucide-react";
import { createActivity, updateActivity, deleteActivity, demoteActivity } from "@/lib/actions/activity";
import { LocationSearch } from "./location-search";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTrip } from "@/lib/trip-context";
import { Sheet } from "@/components/ui/sheet";
import { Button, TextButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldRow, fieldClass, textareaClass } from "@/components/ui/field";
import { categoryStyle } from "@/lib/category-style";

import type { Activity } from "@/lib/actions/activity";
import { ACTIVITY_CATEGORIES as CATEGORIES } from "@/lib/categories";

type AddActivityPanelProps = {
  tripId: string;
  date: string;
  editing: Activity | null;
  onClose: () => void;
  /** Bias location search toward this point (e.g. trip destination or existing activity) */
  proximity?: { lat: number; lng: number };
  /** ISO country codes to filter location results (e.g. ["VN", "MY"]) */
  countries?: string[];
};

export function AddActivityPanel({
  tripId,
  date,
  editing,
  onClose,
  proximity,
  countries,
}: AddActivityPanelProps) {
  const [title, setTitle] = useState(editing?.title ?? "");
  // New activities auto-fill with the next 15-min mark
  const [time, setTime] = useState(() => {
    if (editing) return editing.time ?? "";
    const now = new Date();
    const m = now.getMinutes();
    const nextQuarter = Math.ceil(m / 15) * 15;
    const h = now.getHours() + (nextQuarter >= 60 ? 1 : 0);
    if (h >= 24) return "00:00";
    return `${String(h).padStart(2, "0")}:${String(nextQuarter % 60).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [category, setCategory] = useState(editing?.category ?? "misc");
  const [place, setPlace] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(
    editing?.place_name && editing?.place_lat && editing?.place_lng
      ? {
          name: editing.place_name,
          lat: parseFloat(editing.place_lat),
          lng: parseFloat(editing.place_lng),
        }
      : null
  );
  const [activityDate, setActivityDate] = useState(editing?.date ?? date);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDemoteConfirm, setShowDemoteConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const trip = useTrip();

  useEffect(() => {
    // Focus the title input on open
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (editing) {
        await updateActivity(editing.id, tripId, {
          date: activityDate,
          title: title.trim(),
          time: time || null,
          notes: notes.trim() || null,
          category,
          place_name: place?.name ?? null,
          place_lat: place ? String(place.lat) : null,
          place_lng: place ? String(place.lng) : null,
        });
      } else {
        await createActivity(tripId, {
          date: activityDate,
          title: title.trim(),
          time: time || undefined,
          notes: notes.trim() || undefined,
          category,
          place_name: place?.name,
          place_lat: place ? String(place.lat) : undefined,
          place_lng: place ? String(place.lng) : undefined,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast("Failed to save activity. Please try again.", "error");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteActivity(editing.id, tripId);
      onClose();
    } catch (err) {
      console.error(err);
      toast("Failed to delete activity. Please try again.", "error");
      setSaving(false);
    }
  }

  async function handleDemote() {
    if (!editing) return;
    setSaving(true);
    try {
      await demoteActivity(editing.id, tripId);
      toast("Moved back to ideas", "success");
      onClose();
    } catch (err) {
      console.error(err);
      toast("Failed to demote activity. Please try again.", "error");
      setSaving(false);
    }
  }

  const [hh, mm] = time ? time.split(":") : ["", ""];
  const selectClass = `${fieldClass} w-[76px] px-2.5`;

  return (
    <>
      <Sheet
        open
        title={editing ? "Edit activity" : "Add activity"}
        onClose={onClose}
        footer={
          <>
            <div className="flex gap-2.5">
              <Button variant="quiet" size="lg" full onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" full onClick={handleSave} disabled={!title.trim() || saving}>
                {saving ? "Saving…" : editing ? "Save" : "Add"}
              </Button>
            </div>
            {/* Secondary actions — only in edit mode */}
            {editing && (
              <div className="flex items-center justify-center gap-5 pt-2">
                <TextButton tone="muted" icon={ArrowDownToLine} onClick={() => setShowDemoteConfirm(true)} disabled={saving}>
                  Move to ideas
                </TextButton>
                <TextButton tone="danger" onClick={() => setShowDeleteConfirm(true)} disabled={saving}>
                  Delete
                </TextButton>
              </div>
            )}
          </>
        }
      >
        <div className="space-y-3 pb-1">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            placeholder="What's the plan?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            className="w-full bg-transparent text-[19px] font-semibold text-fg placeholder:text-fg-faint outline-none border-b border-line focus:border-brand pb-2.5 transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) handleSave();
            }}
          />

          {/* Time — HH : MM dropdowns (15-min intervals) */}
          <FieldRow label="Time" htmlFor="activity-hh">
            <select
              id="activity-hh"
              aria-label="Hour"
              value={hh}
              onChange={(e) => {
                const h = e.target.value;
                if (!h) { setTime(""); return; }
                setTime(`${h}:${mm || "00"}`);
              }}
              className={selectClass}
            >
              <option value="">HH</option>
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-sm text-fg-muted">:</span>
            <select
              aria-label="Minutes"
              value={mm}
              onChange={(e) => setTime(`${hh || "09"}:${e.target.value}`)}
              disabled={!time}
              className={`${selectClass} disabled:opacity-50`}
            >
              <option value="">MM</option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            {time && (
              <TextButton tone="muted" onClick={() => setTime("")} className="ml-1">
                Clear
              </TextButton>
            )}
          </FieldRow>

          {/* Date — always shown so you can change which day */}
          <FieldRow label="Date" htmlFor="activity-date">
            <input
              id="activity-date"
              type="date"
              value={activityDate}
              min={trip?.start_date}
              max={trip?.end_date}
              onChange={(e) => setActivityDate(e.target.value)}
              className={fieldClass}
            />
          </FieldRow>

          {/* Location */}
          <LocationSearch value={place} onChange={setPlace} proximity={proximity} countries={countries} />

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap pt-1">
            {CATEGORIES.map((cat) => {
              const style = categoryStyle(cat.value);
              return (
                <Chip
                  key={cat.value}
                  selected={category === cat.value}
                  icon={style.icon}
                  iconClassName={style.strong}
                  onClick={() => setCategory(cat.value)}
                >
                  {style.label}
                </Chip>
              );
            })}
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            aria-label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </div>
      </Sheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete activity"
        message={`Are you sure you want to delete "${editing?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showDemoteConfirm}
        title="Move to ideas"
        message={`Move "${editing?.title}" back to your ideas list? Its time, location, and notes will be preserved.`}
        confirmLabel="Move"
        destructive={false}
        onConfirm={handleDemote}
        onCancel={() => setShowDemoteConfirm(false)}
      />
    </>
  );
}
