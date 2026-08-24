"use client";

import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-sm text-muted mb-3">Something went wrong loading this tab.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
      >
        Tap to retry
      </button>
    </div>
  );
}
