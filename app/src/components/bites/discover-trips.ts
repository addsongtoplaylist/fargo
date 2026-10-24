import type { DiningSpot } from "@/lib/actions/bites";

/**
 * A trip Discover can add a place to (v0.7.0). Inside a trip it's just that
 * trip; from home it's your ongoing and upcoming trips, ongoing first.
 */
export type DiscoverTrip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  countryCode: string | null;
  /** Planners add to the schedule; members suggest the place as an idea */
  isPlanner: boolean;
};

/** A Discover place as an idea, keeping its map pin */
export function placeIdea(spot: DiningSpot) {
  return {
    title: spot.name,
    link: spot.googleMapsUri || undefined,
    notes: [spot.cuisine, spot.priceTier].filter(Boolean).join(" · ") || undefined,
    category: "food",
    place_name: spot.address || spot.name,
    lat: spot.lat,
    lng: spot.lng,
  };
}
