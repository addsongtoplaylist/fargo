"use client";

import { useEffect } from "react";
import { RotateCw, CloudOff } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

/** A trip section failed to load (redesign P8b): card with icon + retry. */
export function TabError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tab error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[var(--max-width-column)] px-4 pt-2">
      <div className="bg-surface rounded-card">
        <Empty
          icon={CloudOff}
          message="Something went wrong loading this section."
          action={
            <Button variant="soft" size="sm" icon={RotateCw} onClick={reset}>
              Tap to retry
            </Button>
          }
        />
      </div>
    </div>
  );
}
