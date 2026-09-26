"use client";

import { Star, MapPin } from "lucide-react";
import type { DiningSpot } from "@/lib/actions/bites";

type DiningCardProps = {
  spot: DiningSpot;
  onTap: () => void;
};

export function DiningCard({ spot, onTap }: DiningCardProps) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-ink/20 transition-colors"
    >
      <div className="flex gap-3">
        {/* Photo thumbnail */}
        <div className="w-16 h-16 rounded-md bg-ground shrink-0 overflow-hidden">
          {spot.photoUri ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google Places photo; next/image would add optimisation cost
            <img
              src={spot.photoUri}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <MapPin size={16} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{spot.name}</p>
          <p className="text-xs text-muted mt-0.5">
            {spot.cuisine} · {spot.priceTier} · {spot.distanceLabel}
            {spot.isOpen === true && (
              <span className="text-green-600"> · Open</span>
            )}
            {spot.isOpen === false && (
              <span className="text-red-500"> · Closed</span>
            )}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-amber-500 fill-amber-500" />
            <span className="text-xs text-ink font-medium">
              {spot.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted">
              ({spot.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
