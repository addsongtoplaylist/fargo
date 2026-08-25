"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { createActivity, updateActivity, deleteActivity } from "@/lib/actions/activity";
import { LocationSearch } from "./location-search";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Activity } from "@/lib/actions/activity";
import { ACTIVITY_CATEGORIES as CATEGORIES } from "@/lib/categories";

type AddActivityPanelProps = {
  tripId: string;
  date: string;
  editing: Activity | null;
  onClose: () => void;
  /** Bias location search toward this point (e.g. trip destination or existing activity) */
  proximity?: { lat: number; lng: number };
};

export function AddActivityPanel({
  tripId,
  date,
  editing,
  onClose,
  proximity,
}: AddActivityPanelProps) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [time, setTime] = useState(editing?.time ?? "");
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
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
          date,
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
      toast("Failed to save activity. Please try again.");
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
      toast("Failed to delete activity. Please try again.");
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 z-[60]"
        onClick={onClose}
      />

      {/* Panel — z-[60] to sit above the bottom nav (z-50), max-h + overflow for small screens */}
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-2xl border-t border-border max-w-[var(--max-width-column)] mx-auto animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">
            {editing ? "Edit activity" : "Add activity"}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center -mr-2 text-muted hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 py-3 space-y-3">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            placeholder="What's the plan?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-base font-medium text-ink placeholder:text-muted/50 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) handleSave();
            }}
          />

          {/* Time */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted w-10">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
            {time && (
              <button
                onClick={() => setTime("")}
                className="text-xs text-muted hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Location */}
          <LocationSearch value={place} onChange={setPlace} proximity={proximity} />

          {/* Category chips */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`
                  px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${
                    category === cat.value
                      ? "bg-accent text-accent-on"
                      : "bg-ground text-muted border border-border hover:border-accent/40"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-ground border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Footer — clears the 56px bottom nav + safe area */}
        <div className="px-4 pt-3 pb-[calc(0.75rem+56px+env(safe-area-inset-bottom))] border-t border-border flex items-center gap-2">
          {editing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="text-xs text-money-over hover:text-money-over/80 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-1.5 bg-accent text-accent-on text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save" : "Add"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete activity"
        message={`Are you sure you want to delete "${editing?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
