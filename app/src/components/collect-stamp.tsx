"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Stamp } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { StampArt, tiltFor } from "@/components/passport-stamp";
import { collectStamp, type CollectedStamp } from "@/lib/actions/stamps";

/**
 * Collect a trip's stamp (STAMPS.md v2.2). Before: the stamp shows faded behind a Collect button.
 * Tap: it's pressed onto the page (stamp-press animation) and saved to your Passport.
 * - `card` — trip overview, once the trip has ended: "Trip complete!" + View in Passport.
 * - `row` — Passport's "to collect" list; the page refreshes after the animation.
 */
export function CollectStamp({
  tripId,
  preview,
  variant,
  tripName,
}: {
  tripId: string;
  preview: CollectedStamp;
  variant: "card" | "row";
  tripName?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [stamp, setStamp] = useState<CollectedStamp | null>(null);
  const shown = stamp ?? preview;
  const tilt = tiltFor(tripId);

  function collect() {
    startTransition(async () => {
      const res = await collectStamp(tripId);
      if ("error" in res) {
        toast(res.error, "error");
        return;
      }
      setStamp(res.stamp);
      // Passport: let the animation play, then move the stamp into the grid
      if (variant === "row") setTimeout(() => router.refresh(), 1400);
    });
  }

  const art = (size: number) =>
    stamp ? (
      <div className="animate-stamp-press" style={{ ["--tilt" as string]: `${tilt}deg` }}>
        <StampArt file={shown.file} place={shown.place} month={shown.month} size={size} />
      </div>
    ) : (
      // Not yet yours: faded and a little blurred
      <div className="opacity-50 blur-[1px]" style={{ transform: `rotate(${tilt}deg)` }} aria-hidden>
        <StampArt file={shown.file} place={shown.place} month={shown.month} size={size} />
      </div>
    );

  if (variant === "row") {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <div className="w-14 h-14 flex items-center justify-center shrink-0">{art(56)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg truncate">{tripName}</p>
          <p className="text-xs text-fg-muted truncate mt-px">
            {shown.place} · {shown.month.charAt(0) + shown.month.slice(1, 3).toLowerCase() + shown.month.slice(3)}
          </p>
        </div>
        {stamp ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-money-ok shrink-0">
            <Check size={15} strokeWidth={2.4} aria-hidden /> Collected
          </span>
        ) : (
          <Button size="sm" onClick={collect} disabled={pending} className="shrink-0">
            {pending ? "Collecting…" : "Collect"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#f6efe2] rounded-card p-4 flex items-center gap-4">
      <div className="w-[104px] h-[104px] flex items-center justify-center shrink-0">{art(104)}</div>
      <div className="flex-1 min-w-0">
        {stamp ? (
          <>
            <p className="text-base font-bold text-[#5b4a2e]">Stamp collected!</p>
            <p className="text-[13px] text-[#8a7655] mt-0.5">{shown.place} is in your Passport now.</p>
            <Link href="/passport" className={`${buttonClasses("soft", "sm")} mt-3`}>
              View in Passport
            </Link>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-[#5b4a2e]">Trip complete!</p>
            <p className="text-[13px] text-[#8a7655] mt-0.5">
              You&apos;ve earned a stamp from <span className="font-semibold">{shown.place}</span>.
            </p>
            <Button size="sm" icon={Stamp} onClick={collect} disabled={pending} className="mt-3">
              {pending ? "Collecting…" : "Collect stamp"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
