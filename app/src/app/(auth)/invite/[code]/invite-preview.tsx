"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinTripByInviteCode, claimTraveller, type InviteTrip } from "@/lib/actions/trip";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteShell, InviteTripSummary } from "./invite-card";

type InvitePreviewProps = {
  trip: InviteTrip;
  inviteCode: string;
  alreadyMember: boolean;
};

export function InvitePreview({ trip, inviteCode, alreadyMember }: InvitePreviewProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Names nobody has claimed yet — if any, you must pick yours (D42)
  const unclaimed = (trip.travellers ?? []).filter((t) => !t.claimed);
  const mustPick = !alreadyMember && unclaimed.length > 0;
  const [picked, setPicked] = useState<string | null>(null);

  async function handleJoin() {
    if (mustPick && !picked) return;
    setJoining(true);
    setError(null);
    const result = mustPick && picked
      ? await claimTraveller(inviteCode, picked)
      : await joinTripByInviteCode(inviteCode);
    if (result.tripId) {
      router.push(`/trips/${result.tripId}/overview`);
    } else {
      setError(result.error || "Something went wrong");
      setJoining(false);
    }
  }

  function handleClose() {
    router.push("/trips");
  }

  // If already a member, redirect to the trip
  function handleGoToTrip() {
    router.push(`/trips/${trip.id}/overview`);
  }

  return (
    <InviteShell
      footnote={alreadyMember ? "You're already part of this trip." : "You'll be added as a member and can view the trip plan."}
    >
      <div className="bg-surface rounded-card p-5 relative">
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-fg-muted hover:bg-page hover:text-fg transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="pr-8">
          <InviteTripSummary trip={trip} />
        </div>

        {mustPick && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-fg mb-2">Which one are you?</p>
            <div className="border border-line rounded-field divide-y divide-line overflow-hidden">
              {unclaimed.map((t) => (
                <label
                  key={t.id}
                  htmlFor={`claim-${t.id}`}
                  className={`flex items-center gap-3 px-3.5 min-h-[48px] cursor-pointer transition-colors ${picked === t.id ? "bg-brand-soft" : "hover:bg-page"}`}
                >
                  <input
                    id={`claim-${t.id}`}
                    type="radio"
                    name="claim"
                    checked={picked === t.id}
                    onChange={() => setPicked(t.id)}
                    className="w-[18px] h-[18px] accent-[#0071bc]"
                  />
                  <span className={`flex-1 text-[15px] ${picked === t.id ? "text-brand font-semibold" : "text-fg"}`}>{t.display_name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-fg-muted mt-2">Your name isn&apos;t here? Ask the planner to add it first.</p>
          </div>
        )}

        {error && <p role="alert" className="text-[13px] font-medium text-money-over mt-4">{error}</p>}

        {alreadyMember ? (
          <Button size="lg" full className="mt-5" onClick={handleGoToTrip}>
            View trip
          </Button>
        ) : (
          <Button size="lg" full className="mt-5" onClick={handleJoin} disabled={joining || (mustPick && !picked)}>
            {joining && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {joining
              ? "Joining…"
              : mustPick && picked
                ? `Join as ${unclaimed.find((t) => t.id === picked)?.display_name}`
                : "Join trip"}
          </Button>
        )}
      </div>
    </InviteShell>
  );
}
