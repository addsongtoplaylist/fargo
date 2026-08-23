"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const selectedIndex = days.findIndex(
    (d) => format(d, "yyyy-MM-dd") === selectedDate
  );

  // Scroll the selected day into view on mount
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "instant" });
    }
  }, []);

  function goToPrev() {
    if (selectedIndex > 0) {
      onSelect(format(days[selectedIndex - 1], "yyyy-MM-dd"));
    }
  }

  function goToNext() {
    if (selectedIndex < days.length - 1) {
      onSelect(format(days[selectedIndex + 1], "yyyy-MM-dd"));
    }
  }

  // Scroll selected day into view when it changes
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const elLeft = el.offsetLeft;
      const elRight = elLeft + el.offsetWidth;
      const visLeft = container.scrollLeft;
      const visRight = visLeft + container.offsetWidth;

      if (elLeft < visLeft + 40 || elRight > visRight - 40) {
        const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedDate]);

  return (
    <div className="flex items-center gap-1">
      {/* Left arrow */}
      <button
        onClick={goToPrev}
        disabled={selectedIndex <= 0}
        className="shrink-0 w-7 h-7 flex items-center justify-center text-muted hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-default"
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Day pills */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none py-2 flex-1"
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

      {/* Right arrow */}
      <button
        onClick={goToNext}
        disabled={selectedIndex >= days.length - 1}
        className="shrink-0 w-7 h-7 flex items-center justify-center text-muted hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-default"
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
