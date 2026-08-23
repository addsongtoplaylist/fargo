"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, ExternalLink, ArrowRight } from "lucide-react";
import { createIdea, updateIdea, deleteIdea, promoteIdea } from "@/lib/actions/idea";
import { useTrip } from "@/lib/trip-context";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import type { Idea } from "@/lib/actions/idea";

type IdeasSectionProps = {
  ideas: Idea[];
  tripId: string;
  isPlanner?: boolean;
};

export function IdeasSection({ ideas, tripId, isPlanner = true }: IdeasSectionProps) {
  const trip = useTrip();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Trip days for the promote picker
  const tripDays = trip
    ? eachDayOfInterval({
        start: parseISO(trip.start_date),
        end: parseISO(trip.end_date),
      })
    : [];

  async function handleAdd() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createIdea(tripId, {
        title: title.trim(),
        link: link.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setTitle("");
      setLink("");
      setNotes("");
      setAdding(false);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  async function handleDelete(ideaId: string) {
    await deleteIdea(ideaId, tripId);
    setDeleteId(null);
  }

  function startEditing(idea: Idea) {
    setEditingId(idea.id);
    setEditText(idea.title);
  }

  async function handleEditSave(ideaId: string) {
    if (!editText.trim() || editText.trim() === ideas.find((i) => i.id === ideaId)?.title) {
      setEditingId(null);
      return;
    }
    await updateIdea(ideaId, tripId, { title: editText.trim() });
    setEditingId(null);
  }

  async function handlePromote(ideaId: string, date: Date, dayIndex: number) {
    await promoteIdea(ideaId, tripId, format(date, "yyyy-MM-dd"), `Day ${dayIndex + 1}`);
    setPromoteId(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink">Ideas</h3>
        {isPlanner && (
          <button
            onClick={() => {
              setAdding(true);
              setTimeout(() => titleRef.current?.focus(), 100);
            }}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {/* Ideas list */}
      <div className="space-y-1.5">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className={`bg-card rounded-lg border border-border px-3 py-2.5 ${
              idea.promoted ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {editingId === idea.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(idea.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleEditSave(idea.id)}
                    className="text-sm font-medium text-ink bg-transparent outline-none w-full border-b border-accent"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-sm font-medium text-ink ${
                      idea.promoted ? "line-through" : ""
                    } ${!idea.promoted ? "cursor-text" : ""}`}
                    onClick={() => !idea.promoted && startEditing(idea)}
                  >
                    {idea.title}
                  </p>
                )}
                {idea.promoted && idea.promoted_date && (
                  <p className="text-xs text-accent mt-0.5">
                    → Promoted to {idea.promoted_date}
                  </p>
                )}
                {!idea.promoted && idea.notes && (
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {idea.notes}
                  </p>
                )}
                {!idea.promoted && idea.link && (
                  <a
                    href={idea.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent mt-0.5 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={10} />
                    Link
                  </a>
                )}
              </div>

              {isPlanner && (
                <div className="flex items-center gap-1 shrink-0">
                  {/* Schedule / Reschedule button */}
                  <button
                    onClick={() =>
                      setPromoteId(promoteId === idea.id ? null : idea.id)
                    }
                    className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-0.5 px-1.5 py-0.5"
                  >
                    <ArrowRight size={12} />
                    {idea.promoted ? "Reschedule" : "Schedule"}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteId(idea.id)}
                    className="text-muted hover:text-money-over transition-colors p-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Day picker for promote */}
            {promoteId === idea.id && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted mb-1.5">Pick a day:</p>
                <div className="flex gap-1 flex-wrap">
                  {tripDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromote(idea.id, day, index)}
                      className="px-2 py-1 text-xs bg-ground border border-border rounded-md hover:border-accent hover:text-accent transition-colors"
                    >
                      Day {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {ideas.length === 0 && !adding && (
          <p className="text-sm text-muted py-4 text-center">
            No ideas yet. Add things you find along the way.
          </p>
        )}

        {/* Inline add form */}
        {adding && (
          <div className="bg-card rounded-lg border border-accent/40 px-3 py-2.5 space-y-2">
            <input
              ref={titleRef}
              type="text"
              placeholder="What's the idea?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted/50 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <input
              type="url"
              placeholder="Link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-ground border border-border rounded-md px-2 py-1 text-xs text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-ground border border-border rounded-md px-2 py-1 text-xs text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAdding(false)}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!title.trim() || saving}
                className="px-3 py-1 bg-accent text-accent-on text-xs font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete idea"
        message={`Are you sure you want to delete "${ideas.find((i) => i.id === deleteId)?.title}"?`}
        onConfirm={() => { if (deleteId) return handleDelete(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
