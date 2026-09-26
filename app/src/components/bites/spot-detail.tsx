"use client";

import { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Navigation,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { DiningSpot } from "@/lib/actions/bites";
import { AddToSchedule } from "@/components/bites/add-to-schedule";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-[var(--max-width-column)] bg-card rounded-t-2xl border-t border-border px-4 pt-3 pb-20 animate-slide-up">
        {/* Handle */}
        <div className="w-8 h-1 bg-border rounded-full mx-auto mb-4" />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 text-muted hover:text-ink"
        >
          <X size={18} />
        </button>

        {/* Name + meta */}
        <h3 className="text-base font-semibold text-ink pr-8">{spot.name}</h3>
        <p className="text-xs text-muted mt-0.5">
          {spot.cuisine} · {spot.priceTier} · {spot.distanceLabel}
          {spot.isOpen === true && (
            <span className="text-green-600"> · Open now</span>
          )}
          {spot.isOpen === false && (
            <span className="text-red-500"> · Closed</span>
          )}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="text-sm text-ink font-medium">
            {spot.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted">
            ({spot.reviewCount.toLocaleString()} reviews)
          </span>
        </div>

        {/* Photo */}
        {spot.photoUri && (
          <div className="mt-3 rounded-lg overflow-hidden bg-ground h-40">
            <img
              src={spot.photoUri}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-1.5 mt-3">
          <MapPin size={12} className="text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-muted">{spot.address}</p>
        </div>

        {/* Google Maps link */}
        {spot.googleMapsUri && (
          <a
            href={spot.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1 ml-4"
          >
            View on Google Maps <ExternalLink size={10} />
          </a>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowAddToSchedule(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} />
            Add to schedule
          </button>
          <a
            href={navigateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-accent-soft transition-colors"
          >
            <Navigation size={14} />
            Navigate
          </a>
        </div>
        <p className="text-center text-[10px] text-muted mt-1.5">
          Opens in Google Maps
        </p>
      </div>
    </div>
  );
}
