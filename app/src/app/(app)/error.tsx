"use client";

import { useEffect } from "react";
import { Column } from "@/components/column";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <Column className="py-12">
      <div className="text-center">
        <p className="text-4xl mb-4">😵</p>
        <h1 className="text-xl font-semibold text-ink mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
          An unexpected error occurred. This might be a temporary issue — try
          again or go back to your trips.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            Try again
          </button>
          <a
            href="/trips"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            Back to My Trips
          </a>
        </div>
      </div>
    </Column>
  );
}
