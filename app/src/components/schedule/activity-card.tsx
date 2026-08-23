"use client";

import { Clock, MapPin, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Activity } from "@/lib/actions/activity";

const CATEGORY_EMOJI: Record<string, string> = {
  flights: "✈️",
  accommodation: "🏨",
  food: "🍜",
  transport: "🚕",
  activities: "🏛",
  shopping: "🛒",
  misc: "📦",
};

type ActivityCardProps = {
  activity: Activity;
  isYouAreHere: boolean;
  onEdit: (activity: Activity) => void;
};

export function ActivityCard({
  activity,
  isYouAreHere,
  onEdit,
}: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-card rounded-lg border border-border flex items-stretch
        transition-colors cursor-pointer hover:border-accent/40
        ${isYouAreHere ? "border-l-[3px] border-l-accent" : ""}
        ${isDragging ? "shadow-lg z-10" : ""}
      `}
      onClick={() => onEdit(activity)}
    >
      {/* Drag handle — activator node so only the handle triggers drag */}
      <button
        ref={setActivatorNodeRef}
        className="flex items-center px-1.5 text-border hover:text-muted shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* Content */}
      <div className="flex-1 py-2.5 pr-3 min-w-0">
        <div className="flex items-start gap-2">
          <span className="text-sm shrink-0">
            {CATEGORY_EMOJI[activity.category] ?? "📦"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {activity.title}
            </p>
            {activity.notes && (
              <p className="text-xs text-muted mt-0.5 truncate">
                {activity.notes}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {activity.time && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={11} />
                  {activity.time}
                </span>
              )}
              {activity.place_name && (
                <span className="flex items-center gap-1 text-xs text-muted truncate">
                  <MapPin size={11} />
                  {activity.place_name}
                </span>
              )}
            </div>
          </div>
          {activity.cost && (
            <span className="text-xs font-medium text-accent shrink-0 money">
              {parseFloat(activity.cost).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
