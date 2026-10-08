"use client";

import { useState, useRef } from "react";
import { X, ExternalLink, CalendarPlus, Clock, MapPin, Lightbulb, Plus } from "lucide-react";
import { createIdea, updateIdea, deleteIdea, promoteIdea } from "@/lib/actions/idea";
import { useTrip } from "@/lib/trip-context";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import type { Idea } from "@/lib/actions/idea";
import { Empty } from "@/components/ui/empty";
import { Button, TextButton } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { useToast } from "@/components/toast";

type IdeasSectionProps = {
  ideas: Idea[];
  tripId: string;
  isPlanner?: boolean;
  /** Signed-in account — "You suggested" and edit rights on your own ideas */
  myAccountId?: string | null;
};

/**
 * Ideas (v0.5.4, docs/IDEAS.md): everyone on the trip adds ideas; the author
 * or the planner edits / deletes; only the planner moves one to Schedule.
 */
export function IdeasSection({ ideas, tripId, isPlanner = true, myAccountId = null }: IdeasSectionProps) {
  const trip = useTrip();
  const { toast } = useToast();

  const canEdit = (idea: Idea) => isPlanner || (!!myAccountId && idea.created_by === myAccountId);
  const authorLabel = (idea: Idea) => {
    if (!idea.created_by) return null;
    if (idea.created_by === myAccountId) return "You suggested";
    const name = trip?.travellers?.find((t) => t.account_id === idea.created_by)?.display_name;
    return name ? `${name} suggested` : null;
  };
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
      toast("Couldn't add the idea. Please try again.", "error");
    }
    setSaving(false);
  }

  async function handleDelete(ideaId: string) {
    try {
      await deleteIdea(ideaId, tripId);
    } catch (err) {
      console.error(err);
      toast("Couldn't delete the idea. Please try again.", "error");
    }
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
    try {
      await updateIdea(ideaId, tripId, { title: editText.trim() });
    } catch (err) {
      console.error(err);
      toast("Couldn't save the idea. Please try again.", "error");
    }
    setEditingId(null);
  }

  async function handlePromote(ideaId: string, date: Date, dayIndex: number) {
    await promoteIdea(ideaId, tripId, format(date, "yyyy-MM-dd"), `Day ${dayIndex + 1}`);
    setPromoteId(null);
  }

  const promotedLabel = (d: string) => {
    try {
      return format(parseISO(d), "EEE d MMM");
    } catch {
      return d;
    }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-baseline justify-between px-1 mb-2">
        <h2 className="text-base font-semibold text-fg">Ideas</h2>
        <TextButton
          icon={Plus}
          onClick={() => {
            setAdding(true);
            setTimeout(() => titleRef.current?.focus(), 100);
          }}
          className="py-0"
        >
          {isPlanner ? "Add" : "Suggest"}
        </TextButton>
      </div>

      {/* Inline add form */}
      {adding && (
        <div className="bg-surface rounded-card p-4 mb-3 space-y-2.5">
          <input
            ref={titleRef}
            type="text"
            placeholder="What's the idea?"
            aria-label="Idea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <input
            type="url"
            placeholder="Link (optional)"
            aria-label="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={fieldClass}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            aria-label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={fieldClass}
          />
          <div className="flex justify-end gap-2 pt-0.5">
            <Button variant="quiet" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!title.trim() || saving}>
              {saving ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>
      )}

      {ideas.length === 0 && !adding ? (
        <div className="bg-surface rounded-card">
          <Empty icon={Lightbulb} message="No ideas yet. Add things you find along the way." />
        </div>
      ) : ideas.length > 0 ? (
        <div className="bg-surface rounded-card divide-y divide-line">
          {ideas.map((idea) => (
            <div key={idea.id} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <div className={`flex-1 min-w-0 ${idea.promoted ? "opacity-60" : ""}`}>
                  {editingId === idea.id ? (
                    <input
                      type="text"
                      aria-label="Idea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(idea.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleEditSave(idea.id)}
                      className="text-[15px] font-semibold text-fg bg-transparent outline-none w-full border-b border-brand py-0.5"
                      autoFocus
                    />
                  ) : (
                    <p
                      className={`text-[15px] font-semibold text-fg ${idea.promoted ? "line-through" : ""} ${
                        canEdit(idea) && !idea.promoted ? "cursor-text" : ""
                      }`}
                      onClick={() => canEdit(idea) && !idea.promoted && startEditing(idea)}
                    >
                      {idea.title}
                    </p>
                  )}
                  {authorLabel(idea) && <p className="text-xs text-fg-muted mt-0.5">{authorLabel(idea)}</p>}
                  {idea.promoted && idea.promoted_date && (
                    <p className="text-[13px] font-medium text-brand mt-0.5">→ Promoted to {promotedLabel(idea.promoted_date)}</p>
                  )}
                  {/* Time + location from demoted activities */}
                  {!idea.promoted && (idea.time || idea.place_name) && (
                    <div className="flex items-center gap-3 mt-1 min-w-0">
                      {idea.time && (
                        <span className="flex items-center gap-1 text-[13px] text-fg-muted shrink-0">
                          <Clock size={13} aria-hidden />
                          {idea.time}
                        </span>
                      )}
                      {idea.place_name && (
                        <span className="flex items-center gap-1 text-[13px] text-fg-muted min-w-0">
                          <MapPin size={13} className="shrink-0" aria-hidden />
                          <span className="truncate">{idea.place_name}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {!idea.promoted && idea.notes && <p className="text-[13px] text-fg-muted mt-1 truncate">{idea.notes}</p>}
                  {!idea.promoted && idea.link && (
                    <a
                      href={idea.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-brand mt-1 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} aria-hidden />
                      Link
                    </a>
                  )}
                </div>

                {canEdit(idea) && (
                  <div className="flex items-center gap-0.5 shrink-0 -mr-2">
                    {/* Schedule / Reschedule — planner only */}
                    {isPlanner && (
                      <Button
                        variant="soft"
                        size="sm"
                        icon={CalendarPlus}
                        aria-expanded={promoteId === idea.id}
                        onClick={() => setPromoteId(promoteId === idea.id ? null : idea.id)}
                      >
                        {idea.promoted ? "Reschedule" : "Schedule"}
                      </Button>
                    )}
                    <button
                      aria-label={`Delete ${idea.title}`}
                      onClick={() => setDeleteId(idea.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-fg-faint hover:text-money-over transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Day picker for promote */}
              {isPlanner && promoteId === idea.id && (
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-[13px] text-fg-muted mb-2">Pick a day</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {tripDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromote(idea.id, day, index)}
                        title={format(day, "EEE d MMM")}
                        className="h-8 px-2.5 text-[13px] font-medium text-fg bg-page border border-line rounded-full hover:border-brand hover:text-brand transition-colors"
                      >
                        Day {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete idea"
        message={`Are you sure you want to delete "${ideas.find((i) => i.id === deleteId)?.title}"?`}
        onConfirm={() => { if (deleteId) return handleDelete(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}
