"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinTripByInviteCode } from "@/lib/actions/trip";
import { MapPin, Calendar, Users, X, Loader2 } from "lucide-react";

type InvitePreviewProps = {
  trip: {
    id: string;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    travellers?: { display_name: string; account_id: string }[];
  };
  inviteCode: string;
  alreadyMember: boolean;
};

export function InvitePreview({ trip, inviteCode, alreadyMember }: InvitePreviewProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    const result = await joinTripByInviteCode(inviteCode);
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
    <div className="min-h-full flex flex-col items-center justify-center px-4 bg-ground">
      <div className="w-full max-w-[360px]">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-ink mb-1">Fargo</h1>
          <p className="text-sm text-muted">You've been invited to a trip</p>
        </div>

        {/* Trip card */}
        <div className="bg-card rounded-lg border border-border p-5 mb-4 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <h2 className="text-lg font-semibold text-ink mb-3 pr-8">{trip.name}</h2>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={14} className="text-accent shrink-0" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar size={14} className="text-accent shrink-0" />
              <span>
                {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
              </span>
            </div>
            {trip.travellers && trip.travellers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Users size={14} className="text-accent shrink-0" />
                <div className="flex items-center gap-1.5">
                  {/* Traveller avatars */}
                  <div className="flex -space-x-1.5">
                    {trip.travellers.slice(0, 5).map((t, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-accent/20 border border-card flex items-center justify-center text-[10px] font-medium text-accent"
                        title={t.display_name}
                      >
                        {t.display_name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span>
                    {trip.travellers.length}{" "}
                    {trip.travellers.length === 1 ? "traveller" : "travellers"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-money-over mb-3">{error}</p>
          )}

          {alreadyMember ? (
            <button
              onClick={handleGoToTrip}
              className="w-full h-12 flex items-center justify-center gap-2 bg-accent text-accent-on rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              You're already a member — view trip
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full h-12 flex items-center justify-center gap-2 bg-accent text-accent-on rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              {joining && <Loader2 size={16} className="animate-spin" />}
              {joining ? "Joining…" : "Join trip"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted">
          {alreadyMember
            ? "You're already part of this trip."
            : "You'll be added as a member and can view the trip plan."}
        </p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
