"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, eachDayOfInterval, parseISO, isToday } from "date-fns";

// Where the strip must scroll to centre the selected day. The strip is
// `relative`, so offsetLeft is measured from the strip itself (it used to be
// measured from the page, which could leave the strip on Days 1–5).
function centreLeft(container: HTMLDivElement | null, el: HTMLButtonElement | null) {
  if (!container || !el) return null;
  return el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
}

type DayPickerProps = {
  startDate: string;
  endDate: string;
  selectedDate: string;
  onSelect: (date: string) => void;
  isActiveTrip: boolean;
};

/**
 * Sticky date strip (DESIGN.md v0.8 → Schedule): ‹ · day cells with weekday /
 * date / "Day N" (selected = brand fill, today = dot) · ›. Only this strip
 * sticks while the page scrolls.
 */
export function DayPicker({
  startDate,
  endDate,
  selectedDate,
  onSelect,
  isActiveTrip,
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

  // Jump to the selected day on open (no animation)
  useEffect(() => {
    const left = centreLeft(scrollRef.current, selectedRef.current);
    if (left !== null && scrollRef.current) scrollRef.current.scrollLeft = left;
  }, []);

  // Scroll the selected day into view when it changes (if near/out of view)
  useEffect(() => {
    const container = scrollRef.current;
    const el = selectedRef.current;
    const left = centreLeft(container, el);
    if (!container || !el || left === null) return;
    const elLeft = el.offsetLeft;
    const elRight = elLeft + el.offsetWidth;
    const visLeft = container.scrollLeft;
    const visRight = visLeft + container.clientWidth;
    if (elLeft < visLeft + 24 || elRight > visRight - 24) {
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [selectedDate]);

  function goToPrev() {
    if (selectedIndex > 0) onSelect(format(days[selectedIndex - 1], "yyyy-MM-dd"));
  }

  function goToNext() {
    if (selectedIndex < days.length - 1) onSelect(format(days[selectedIndex + 1], "yyyy-MM-dd"));
  }

  const arrow =
    "shrink-0 w-8 h-[58px] flex items-center justify-center text-fg-muted hover:text-fg transition-colors disabled:opacity-30 disabled:cursor-default";

  return (
    <div className="sticky top-0 z-30 bg-page">
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-2 py-2 flex items-center gap-1">
        <button onClick={goToPrev} disabled={selectedIndex <= 0} className={arrow} aria-label="Previous day">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <div
          ref={scrollRef}
          data-swipe-ignore
          className="relative flex gap-1.5 overflow-x-auto scrollbar-none flex-1"
        >
          {days.map((day, index) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isSelected = dateStr === selectedDate;
            const isCurrentDay = isToday(day) && isActiveTrip;

            return (
              <button
                key={dateStr}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelect(dateStr)}
                aria-pressed={isSelected}
                aria-label={`${format(day, "EEEE d MMMM")}, Day ${index + 1}${isCurrentDay ? ", today" : ""}`}
                className={`relative flex flex-col items-center justify-center shrink-0 w-[50px] h-[58px] rounded-[14px] transition-colors ${
                  isSelected ? "bg-brand text-brand-on" : "bg-surface text-fg hover:bg-brand-soft"
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase leading-none ${isSelected ? "" : "text-fg-muted"}`}>
                  {format(day, "EEE")}
                </span>
                <span className="text-[17px] font-bold leading-none mt-1">{format(day, "d")}</span>
                <span className={`text-[10px] leading-none mt-1 ${isSelected ? "opacity-80" : "text-fg-muted"}`}>
                  Day {index + 1}
                </span>
                {isCurrentDay && (
                  <span
                    aria-hidden
                    className={`absolute bottom-[3px] w-1 h-1 rounded-full ${isSelected ? "bg-brand-on" : "bg-brand"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button onClick={goToNext} disabled={selectedIndex >= days.length - 1} className={arrow} aria-label="Next day">
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
