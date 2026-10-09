"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, LogOut, Share2 } from "lucide-react";
import { leaveTrip } from "@/lib/actions/trip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ShareTripSheet } from "@/components/share-trip-sheet";
import { tintFor } from "@/components/trip-cover";
import { countryCode } from "@/lib/country-code";
import { coverUrl, coverObjectPosition } from "@/lib/cover";

const ROUND =
  "w-10 h-10 rounded-full bg-white/90 border border-line flex items-center justify-center text-fg shrink-0";

/**
 * Overview cover header (redesign P4). No photo yet (P10) → the trip's colour
 * with its country code large and faint. Back → My trips; planner gear /
 * member Leave (same confirm + rules as before).
 */
export function OverviewHeader({
  tripId,
  name,
  destination,
  subline,
  role,
  coverPath,
  coverPosition,
}: {
  tripId: string;
  coverPath?: string | null;
  coverPosition?: number | null;
  name: string;
  destination: string;
  subline: string;
  role: "planner" | "member" | undefined;
}) {
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [sharing, setSharing] = useState(false);
  const code = countryCode(destination);
  const photo = coverUrl(coverPath);

  async function handleLeave() {
    const result = await leaveTrip(tripId);
    if (result.error) {
      alert(result.error);
    } else {
      router.push("/trips?noauto=1");
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4">
        <div
          className={`relative overflow-hidden rounded-[22px] h-[190px] p-4 flex flex-col justify-between ${
            photo ? "bg-fg text-white" : tintFor(tripId)
          }`}
        >
          {photo && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase storage photo; already resized on upload */}
              <img
                src={photo}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: coverObjectPosition(coverPosition) }}
              />
              {/* Dark gradient from the bottom so white text stays readable (Qantas look) */}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            </>
          )}
          {!photo && code && (
            <span aria-hidden className="absolute -right-1.5 -top-5 text-[130px] font-extrabold tracking-[-4px] opacity-[0.14] leading-none">
              {code}
            </span>
          )}
          <div className="relative flex justify-between">
            <button type="button" onClick={() => router.push("/trips?noauto=1")} className={ROUND} aria-label="Back to My trips">
              <ArrowLeft size={19} strokeWidth={1.9} aria-hidden />
            </button>
            <div className="flex gap-2">
              {/* Share trip pass (v0.5.7) — anyone on the trip */}
              {role && (
                <button type="button" onClick={() => setSharing(true)} className={ROUND} aria-label="Share trip">
                  <Share2 size={18} strokeWidth={1.9} aria-hidden />
                </button>
              )}
              {role === "planner" && (
                <button type="button" onClick={() => router.push(`/trips/${tripId}/settings`)} className={ROUND} aria-label="Trip settings">
                  <Settings size={18} strokeWidth={1.9} aria-hidden />
                </button>
              )}
              {role === "member" && (
                <button type="button" onClick={() => setShowLeaveDialog(true)} className={ROUND} aria-label="Leave trip">
                  <LogOut size={18} strokeWidth={1.9} aria-hidden />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <p className="text-xs font-semibold tracking-[1.2px] uppercase">{destination}</p>
            <h1 className={`text-[26px] font-bold leading-tight mt-1 truncate ${photo ? "text-white" : "text-fg"}`}>{name}</h1>
            <p className={`text-[13px] mt-1 ${photo ? "text-white/85" : "text-fg-muted"}`}>{subline}</p>
          </div>
        </div>
      </div>

      {sharing && <ShareTripSheet tripId={tripId} tripName={name} onClose={() => setSharing(false)} />}

      <ConfirmDialog
        open={showLeaveDialog}
        title="Leave trip"
        message={`You'll be removed from "${name}" and it will disappear from your trips list.`}
        confirmLabel="Leave"
        destructive
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </>
  );
}
