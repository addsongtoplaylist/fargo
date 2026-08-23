"use client";

import { useRef, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

const TAB_ORDER = ["overview", "schedule", "money", "prep", "people"] as const;

type SwipeTabsProps = {
  children: React.ReactNode;
};

export function SwipeTabs({ children }: SwipeTabsProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pathname = usePathname();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  // Find the current tab from the URL
  const currentTab = TAB_ORDER.find((tab) =>
    pathname.endsWith(`/${tab}`)
  );
  const currentIndex = currentTab ? TAB_ORDER.indexOf(currentTab) : -1;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (currentIndex === -1) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only count as a horizontal swipe if X distance > Y distance and > threshold
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX < 60 || absX < absY * 1.5) return;

      let nextIndex = currentIndex;
      if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
        // Swipe left → next tab
        nextIndex = currentIndex + 1;
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right → previous tab
        nextIndex = currentIndex - 1;
      }

      if (nextIndex !== currentIndex) {
        router.push(`/trips/${params.id}/${TAB_ORDER[nextIndex]}`);
      }
    },
    [currentIndex, params.id, router]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 min-h-0"
    >
      {children}
    </div>
  );
}
