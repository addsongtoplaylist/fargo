"use client";

import { Star, MapPin } from "lucide-react";
import type { DiningSpot } from "@/lib/actions/bites";

type DiningCardProps = {
  spot: DiningSpot;
  onTap: () => void;
};

/** Discover result card (redesign P7b): photo, name, cuisine · price · distance · open, rating. */
export function DiningCard({ spot, onTap }: DiningCardProps) {
  return (
    <button onClick={onTap} className="w-full text-left bg-surface rounded-card p-3 hover:bg-brand-soft/40 transition-colors">
      <div className="flex gap-3">
        {/* Photo thumbnail */}
        <div className="w-[68px] h-[68px] rounded-[12px] bg-page shrink-0 overflow-hidden">
          {spot.photoUri ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google Places photo; next/image would add optimisation cost
            <img src={spot.photoUri} alt={spot.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-fg-faint">
              <MapPin size={18} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-[15px] font-semibold text-fg truncate">{spot.name}</p>
          <p className="text-[13px] text-fg-muted mt-0.5">
            {spot.cuisine} · {spot.priceTier} · {spot.distanceLabel}
            {spot.isOpen === true && <span className="text-money-ok font-medium"> · Open</span>}
            {spot.isOpen === false && <span className="text-money-over font-medium"> · Closed</span>}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star size={13} className="text-amber-500 fill-amber-500" aria-hidden />
            <span className="text-[13px] text-fg font-semibold">{spot.rating.toFixed(1)}</span>
            <span className="text-[13px] text-fg-muted">({spot.reviewCount.toLocaleString()})</span>
          </div>
        </div>
      </div>
    </button>
  );
}
