"use client";

import { useRef, useEffect } from "react";
import { format, eachDayOfInterval, parseISO, isToday } from "date-fns";

type DayPickerProps = {
  startDate: string;
  endDate: string;
  selectedDate: string;
  onSelect: (date: string) => void;
  tripStatus: string;
};

export function DayPicker({
  startDate,
  endDate,
  selectedDate,
  onSelect,
  tripStatus,
}: DayPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  // Scroll the selected day into view on mount
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "instant" });
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto scrollbar-none py-2 px-4 -mx-4"
    >
      {days.map((day, index) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const isSelected = dateStr === selectedDate;
        const isCurrentDay = isToday(day) && tripStatus === "active";

        return (
          <button
            key={dateStr}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onSelect(dateStr)}
            className={`
              flex flex-col items-center justify-center shrink-0
              w-[52px] h-[60px] rounded-lg text-center transition-colors
              ${
                isSelected
                  ? "bg-accent text-accent-on"
                  : isCurrentDay
                    ? "bg-accent-soft text-accent border border-accent/30"
                    : "bg-card text-ink border border-border hover:border-accent/40"
              }
            `}
          >
            <span className="text-[10px] font-medium uppercase leading-none mb-0.5">
              {format(day, "EEE")}
            </span>
            <span className="text-lg font-semibold leading-none">
              {format(day, "d")}
            </span>
            <span className="text-[10px] leading-none mt-0.5 opacity-70">
              Day {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
