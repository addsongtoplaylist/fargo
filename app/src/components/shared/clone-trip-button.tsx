"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { cloneTrip } from "@/lib/actions/trip";
import { Button, type ButtonVariant } from "@/components/ui/button";

export function CloneTripButton({ shareCode, variant = "soft" }: { shareCode: string; variant?: ButtonVariant }) {
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
      <Button variant={variant} size={variant === "primary" ? "lg" : "md"} full icon={loading ? undefined : Copy} onClick={handleClone} disabled={loading}>
        {loading && <span className={`w-4 h-4 border-2 rounded-full animate-spin ${variant === "primary" ? "border-white/40 border-t-white" : "border-brand/40 border-t-brand"}`} aria-hidden />}
        {loading ? "Saving…" : "Save as my trip"}
      </Button>
      {error && <p role="alert" className="text-[13px] font-medium text-money-over mt-2 text-center">{error}</p>}
    </div>
  );
}
