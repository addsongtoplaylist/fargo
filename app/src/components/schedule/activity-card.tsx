"use client";

import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { Activity } from "@/lib/actions/activity";

type RowProps = {
  activity: Activity;
  isYouAreHere: boolean;
  isFirst: boolean;
  isLast: boolean;
};

/**
 * Timeline row (DESIGN.md v0.8 → Schedule): time column · category icon on a
 * thin line · bold title + place. Current activity = brand-soft row, brand
 * time, "NOW". No notes, no cost on rows.
 */
function RowBody({
  activity,
  isYouAreHere,
  isFirst,
  isLast,
  handle,
}: RowProps & { handle?: React.ReactNode }) {
  return (
    <>
      <div className={`w-[42px] shrink-0 text-[13px] leading-tight ${isYouAreHere ? "text-brand font-semibold" : "text-fg-muted"}`}>
        {activity.time}
        {isYouAreHere && <span className="block text-[10px] font-bold tracking-[0.5px] mt-0.5">NOW</span>}
      </div>

      <div className="relative self-stretch flex items-center shrink-0">
        <span
          aria-hidden
          className={`absolute left-1/2 -translate-x-1/2 w-px bg-line ${isFirst ? "top-1/2" : "-top-2.5"} ${isLast ? "bottom-1/2" : "-bottom-2.5"}`}
        />
        <span className={`relative rounded-full ${isYouAreHere ? "ring-2 ring-surface" : ""}`}>
          <CategoryIcon category={activity.category} size={34} />
        </span>
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[15px] font-semibold text-fg truncate">{activity.title}</p>
        {activity.place_name && <p className="text-[13px] text-fg-muted truncate mt-0.5">{activity.place_name}</p>}
      </div>

      {handle}
    </>
  );
}

const ROW = "flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-[14px]";

/** Planner row: tap to edit, drag by the handle to reorder. */
export function ActivityCard({
  onEdit,
  ...props
}: RowProps & { onEdit: (activity: Activity) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${ROW} cursor-pointer transition-colors ${
        isDragging
          ? "relative z-10 bg-surface shadow-float"
          : props.isYouAreHere
            ? "bg-brand-soft"
            : "hover:bg-page"
      }`}
      onClick={() => onEdit(props.activity)}
    >
      <RowBody
        {...props}
        handle={
          // Activator node, so only the handle starts a drag
          <button
            ref={setActivatorNodeRef}
            className="w-8 h-10 -mr-1.5 flex items-center justify-center text-fg-faint hover:text-fg-muted shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Drag to reorder ${props.activity.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </button>
        }
      />
    </div>
  );
}

/** Member row: read-only. */
export function ActivityRow(props: RowProps) {
  return (
    <div className={`${ROW} ${props.isYouAreHere ? "bg-brand-soft" : ""}`}>
      <RowBody {...props} />
    </div>
  );
}
