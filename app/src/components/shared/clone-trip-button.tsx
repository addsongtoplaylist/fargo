"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { cloneTrip } from "@/lib/actions/trip";

export function CloneTripButton({ shareCode }: { shareCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClone() {
    setLoading(true);
    setError(null);
    const result = await cloneTrip(shareCode);
    if (result.tripId) {
      router.push(`/trips/${result.tripId}/overview`);
    } else {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClone}
        disabled={loading}
        className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-soft transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Copy size={13} />
            Save as my trip
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
