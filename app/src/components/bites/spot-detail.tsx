"use client";

import { useState } from "react";
import {
  Star,
  MapPin,
  Navigation,
  Plus,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { suggestPlaceIdea } from "@/lib/actions/idea";
import { useToast } from "@/components/toast";
import type { DiningSpot } from "@/lib/actions/bites";
import { AddToSchedule } from "@/components/bites/add-to-schedule";
import { placeIdea, type DiscoverTrip } from "@/components/bites/discover-trips";
import { Sheet } from "@/components/ui/sheet";
import { Button, buttonClasses } from "@/components/ui/button";

type SpotDetailProps = {
  spot: DiningSpot;
  /** Trips the place can go to — one inside a trip, ongoing + upcoming from home */
  trips: DiscoverTrip[];
  onClose: () => void;
};

export function SpotDetail({ spot, trips, onClose }: SpotDetailProps) {
  const [showAddToSchedule, setShowAddToSchedule] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const { toast } = useToast();
  // One trip you're a member of: suggest straight away. Otherwise the add sheet
  // (with a trip picker when there are several) — it also suggests for member trips.
  const onlyTrip = trips.length === 1 ? trips[0] : null;
  const suggestOnly = onlyTrip !== null && !onlyTrip.isPlanner;

  async function handleSuggest() {
    if (!onlyTrip) return;
    setSuggesting(true);
    try {
      await suggestPlaceIdea(onlyTrip.id, placeIdea(spot));
      toast("Suggested — it's in Prep → Ideas", "success");
      onClose();
    } catch (err) {
      console.error(err);
      toast("Couldn't suggest this place. Please try again.", "error");
      setSuggesting(false);
    }
  }

  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  if (showAddToSchedule) {
    return (
      <AddToSchedule
        spot={spot}
        trips={trips}
        onClose={() => setShowAddToSchedule(false)}
        onDone={onClose}
      />
    );
  }

  return (
    <Sheet
      open
      title={spot.name}
      onClose={onClose}
      footer={
        <>
          <div className="flex flex-col gap-2.5">
            {suggestOnly ? (
              <Button size="lg" full icon={Lightbulb} onClick={handleSuggest} disabled={suggesting}>
                {suggesting ? "Suggesting…" : "Suggest as idea"}
              </Button>
            ) : trips.length > 0 ? (
              <Button size="lg" full icon={Plus} onClick={() => setShowAddToSchedule(true)}>
                {onlyTrip ? "Add to schedule" : "Add to a trip"}
              </Button>
            ) : null}
            <a href={navigateUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("quiet", "lg", true)}>
              <Navigation size={16} strokeWidth={2.2} aria-hidden />
              Navigate
            </a>
          </div>
          <p className="text-center text-xs text-fg-muted mt-2">
            {suggestOnly ? "The planner decides what goes on the schedule" : "Navigate opens Google Maps"}
          </p>
        </>
      }
    >
      <div className="pb-1">
        {/* Meta */}
        <p className="text-[13px] text-fg-muted">
          {spot.cuisine} · {spot.priceTier} · {spot.distanceLabel}
          {spot.isOpen === true && <span className="text-money-ok font-medium"> · Open now</span>}
          {spot.isOpen === false && <span className="text-money-over font-medium"> · Closed</span>}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={14} className="text-amber-500 fill-amber-500" aria-hidden />
          <span className="text-sm text-fg font-semibold">{spot.rating.toFixed(1)}</span>
          <span className="text-[13px] text-fg-muted">({spot.reviewCount.toLocaleString()} reviews)</span>
        </div>

        {/* Photo */}
        {spot.photoUri && (
          <div className="mt-3 rounded-card overflow-hidden bg-page h-44">
            {/* eslint-disable-next-line @next/next/no-img-element -- Google Places photo; next/image would add optimisation cost */}
            <img src={spot.photoUri} alt={spot.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Address + Google Maps */}
        <div className="flex items-start gap-2 mt-3">
          <MapPin size={15} className="text-fg-muted shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="text-[13px] text-fg">{spot.address}</p>
            {spot.googleMapsUri && (
              <a
                href={spot.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-hover mt-1"
              >
                View on Google Maps <ExternalLink size={13} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
