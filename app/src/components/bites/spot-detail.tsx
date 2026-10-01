"use client";

import { useState } from "react";
import {
  Star,
  MapPin,
  Navigation,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { DiningSpot } from "@/lib/actions/bites";
import { AddToSchedule } from "@/components/bites/add-to-schedule";
import { Sheet } from "@/components/ui/sheet";
import { Button, buttonClasses } from "@/components/ui/button";

type SpotDetailProps = {
  spot: DiningSpot;
  tripId: string;
  localCurrency: string;
  onClose: () => void;
};

export function SpotDetail({
  spot,
  tripId,
  localCurrency,
  onClose,
}: SpotDetailProps) {
  const [showAddToSchedule, setShowAddToSchedule] = useState(false);

  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  if (showAddToSchedule) {
    return (
      <AddToSchedule
        spot={spot}
        tripId={tripId}
        localCurrency={localCurrency}
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
            <Button size="lg" full icon={Plus} onClick={() => setShowAddToSchedule(true)}>
              Add to schedule
            </Button>
            <a href={navigateUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("quiet", "lg", true)}>
              <Navigation size={16} strokeWidth={2.2} aria-hidden />
              Navigate
            </a>
          </div>
          <p className="text-center text-xs text-fg-muted mt-2">Navigate opens Google Maps</p>
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
