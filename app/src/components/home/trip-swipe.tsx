"use client";

import { Children, useRef, useState } from "react";

/**
 * Horizontal swipe row for the home band (v0.7.0): one card fills the width;
 * with more, each card is slightly narrower so the next one peeks in, and
 * dots show where you are.
 */
export function TripSwipe({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children);
  const many = items.length > 1;
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 12 : el.clientWidth;
    setIndex(Math.round(el.scrollLeft / step));
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={many ? onScroll : undefined}
        data-swipe-ignore
        className={`flex gap-3 ${many ? "overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 scroll-px-4" : ""}`}
      >
        {items.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${many ? "w-[86%]" : "w-full"}`}>
            {child}
          </div>
        ))}
      </div>
      {many && (
        <div className="flex justify-center gap-1.5 mt-2.5" aria-hidden>
          {items.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full bg-white transition-opacity ${i === index ? "opacity-100" : "opacity-45"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
