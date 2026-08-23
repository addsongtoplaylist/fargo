"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Calendar, Users } from "lucide-react";

type InviteLandingProps = {
  trip: {
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    travellers?: { display_name: string }[];
  };
  inviteCode: string;
};

export function InviteLanding({ trip, inviteCode }: InviteLandingProps) {
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/invite/${inviteCode}`,
      },
    });
  }

  const plannerName =
    trip.travellers?.find((t) => true)?.display_name ?? "Someone";

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 bg-ground">
      <div className="w-full max-w-[360px]">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-ink mb-1">Fargo</h1>
          <p className="text-sm text-muted">You've been invited to a trip</p>
        </div>

        {/* Trip card */}
        <div className="bg-card rounded-lg border border-border p-5 mb-4">
          <h2 className="text-lg font-semibold text-ink mb-3">{trip.name}</h2>

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
                <span>
                  {trip.travellers.length}{" "}
                  {trip.travellers.length === 1 ? "traveller" : "travellers"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-accent text-accent-on rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-accent-on/40 border-t-accent-on rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "Signing in…" : "Sign in with Google to join"}
          </button>
        </div>

        <p className="text-center text-xs text-muted">
          You'll be added as a member and can view the trip plan.
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
