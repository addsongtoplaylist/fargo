"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { cloneTrip } from "@/lib/actions/trip";
import { Button } from "@/components/ui/button";

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
      <Button variant="soft" full icon={loading ? undefined : Copy} onClick={handleClone} disabled={loading}>
        {loading && <span className="w-4 h-4 border-2 border-brand/40 border-t-brand rounded-full animate-spin" aria-hidden />}
        {loading ? "Saving…" : "Save as my trip"}
      </Button>
      {error && <p role="alert" className="text-[13px] font-medium text-money-over mt-2 text-center">{error}</p>}
    </div>
  );
}
