"use server";

import { getOrCreateAccount } from "@/lib/account";
import { FILTER_TYPES, ALL_FOOD_TYPES } from "@/lib/bites-filters";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export type DiningSpot = {
  id: string;
  name: string;
  cuisine: string; // primary type label
  priceLevel: number; // 0-4 (Google's scale)
  priceTier: string; // "$", "$$", "$$$"
  rating: number;
  reviewCount: number;
  distance: number; // meters from search center
  distanceLabel: string; // "350m" or "1.2km"
  lat: number;
  lng: number;
  address: string;
  photoUri: string | null; // Google Places photo URI
  isOpen: boolean | null;
  googleMapsUri: string;
  score: number; // internal ranking score
};

export type BitesSearchResult = {
  spots: DiningSpot[];
  total: number;
  error?: string;
};

type SearchParams = {
  lat: number;
  lng: number;
  filterType?: string; // filter key from FILTER_TYPES, default "all"
};

// ──────────────────────────────────────────
// Google Places price level mapping
// ──────────────────────────────────────────

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const BUDGET_TO_MAX_PRICE: Record<string, number> = {
  any: 99, // no filter
  budget: 1, // $ — only inexpensive
  moderate: 2, // $$ — up to moderate
  fine_dining: 4, // $$$ — all price levels
};

function priceTierLabel(level: number): string {
  if (level <= 1) return "$";
  if (level === 2) return "$$";
  return "$$$";
}

// ──────────────────────────────────────────
// Cuisine type mapping
// ──────────────────────────────────────────

const TYPE_TO_CUISINE: Record<string, string> = {
  japanese_restaurant: "Japanese",
  sushi_restaurant: "Sushi",
  ramen_restaurant: "Ramen",
  chinese_restaurant: "Chinese",
  korean_restaurant: "Korean",
  thai_restaurant: "Thai",
  indian_restaurant: "Indian",
  italian_restaurant: "Italian",
  mexican_restaurant: "Mexican",
  french_restaurant: "French",
  vietnamese_restaurant: "Vietnamese",
  american_restaurant: "American",
  mediterranean_restaurant: "Mediterranean",
  middle_eastern_restaurant: "Middle Eastern",
  seafood_restaurant: "Seafood",
  steak_house: "Steakhouse",
  pizza_restaurant: "Pizza",
  hamburger_restaurant: "Burgers",
  cafe: "Cafe",
  coffee_shop: "Coffee",
  bakery: "Bakery",
  fast_food_restaurant: "Fast food",
  vegetarian_restaurant: "Vegetarian",
  vegan_restaurant: "Vegan",
  brunch_restaurant: "Brunch",
  barbecue_restaurant: "BBQ",
  restaurant: "Restaurant",
};

// ──────────────────────────────────────────
// Distance helpers
// ──────────────────────────────────────────

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ──────────────────────────────────────────
// Scoring
// ──────────────────────────────────────────

function scoreDiningSpot(spot: DiningSpot): number {
  // Base score: rating × log(reviewCount + 1) — favors well-reviewed places
  const ratingScore = spot.rating * Math.log10(spot.reviewCount + 1);

  // Distance penalty: closer is better (linear decay over 3km)
  const distanceFactor = Math.max(0.3, 1 - spot.distance / 3000);

  // Open-now boost
  const openBoost = spot.isOpen === true ? 1.1 : 1.0;

  return ratingScore * distanceFactor * openBoost;
}

// Soft-deduplicate by cuisine type — allow up to 2 of the same cuisine,
// skip the 3rd+ unless we've exhausted variety (5+ distinct cuisines seen)
function deduplicateByCuisine<T extends DiningSpot>(spots: T[]): T[] {
  const counts = new Map<string, number>();
  const result: T[] = [];

  for (const spot of spots) {
    const count = counts.get(spot.cuisine) ?? 0;
    const distinctCuisines = counts.size;

    // Always allow the first 2 of any cuisine type
    // After that, only allow if we already have 5+ distinct cuisines
    if (count < 2 || distinctCuisines >= 5) {
      result.push(spot);
      counts.set(spot.cuisine, count + 1);
    }
  }

  return result;
}

// ──────────────────────────────────────────
// Main search action
// ──────────────────────────────────────────

export async function searchDiningSpots(
  params: SearchParams
): Promise<BitesSearchResult> {
  const account = await getOrCreateAccount();
  if (!account) {
    return { spots: [], total: 0, error: "Not signed in" };
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
  if (!apiKey) {
    return { spots: [], total: 0, error: "Google Places API key not configured" };
  }

  const { lat, lng, filterType = "all" } = params;
  const diningBudget = (account.dining_budget as string) || "moderate";
  const isFiltered = filterType !== "all";

  // Resolve filter to Google includedTypes
  const filter = FILTER_TYPES.find((f) => f.key === filterType);
  const includedTypes = filter?.types ?? ALL_FOOD_TYPES;

  try {
    // Call Google Places Nearby Search (New)
    const searchRadius = 2000; // 2km radius
    const maxResults = 20;

    const requestBody: Record<string, unknown> = {
      includedTypes,
      maxResultCount: maxResults,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: searchRadius,
        },
      },
      languageCode: "en",
    };

    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.types",
      "places.priceLevel",
      "places.rating",
      "places.userRatingCount",
      "places.location",
      "places.formattedAddress",
      "places.photos",
      "places.currentOpeningHours",
      "places.googleMapsUri",
    ].join(",");

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Google Places API error:", res.status, errorData);
      return {
        spots: [],
        total: 0,
        error: `Search failed (${res.status})`,
      };
    }

    const data = await res.json();
    const places = (data.places ?? []) as Record<string, unknown>[];

    // Transform to DiningSpot
    const maxPrice = BUDGET_TO_MAX_PRICE[diningBudget] ?? 2;

    let spots: DiningSpot[] = places
      .map((place) => {
        const types = (place.types as string[]) ?? [];
        const priceLevelStr = (place.priceLevel as string) ?? "PRICE_LEVEL_FREE";
        const priceLevel = PRICE_LEVEL_MAP[priceLevelStr] ?? 0;
        const rating = (place.rating as number) ?? 0;
        const reviewCount = (place.userRatingCount as number) ?? 0;
        const loc = place.location as { latitude: number; longitude: number };
        const displayName = place.displayName as { text: string };
        const photos = (place.photos as { name: string }[]) ?? [];
        const openingHours = place.currentOpeningHours as { openNow?: boolean } | undefined;

        // Determine cuisine label from types
        let cuisine = "Restaurant";
        for (const type of types) {
          if (TYPE_TO_CUISINE[type]) {
            cuisine = TYPE_TO_CUISINE[type];
            break;
          }
        }

        const dist = haversineDistance(lat, lng, loc.latitude, loc.longitude);

        // Build photo URI (first photo, medium size)
        let photoUri: string | null = null;
        if (photos.length > 0) {
          photoUri = `https://places.googleapis.com/v1/${photos[0].name}/media?maxWidthPx=400&key=${apiKey}`;
        }

        return {
          id: place.id as string,
          name: displayName?.text ?? "Unknown",
          cuisine,
          priceLevel,
          priceTier: priceTierLabel(priceLevel),
          rating,
          reviewCount,
          distance: Math.round(dist),
          distanceLabel: distanceLabel(dist),
          lat: loc.latitude,
          lng: loc.longitude,
          address: (place.formattedAddress as string) ?? "",
          photoUri,
          isOpen: openingHours?.openNow ?? null,
          googleMapsUri: (place.googleMapsUri as string) ?? "",
          score: 0, // computed below
        };
      })
      // Hard filter: budget
      .filter((spot) => spot.priceLevel <= maxPrice);

    // Score each spot
    spots = spots.map((spot) => ({
      ...spot,
      score: scoreDiningSpot(spot),
    }));

    // Sort by score descending
    spots.sort((a, b) => b.score - a.score);

    // Deduplicate by cuisine for variety — only when showing "all" types.
    // When user picks a specific filter, show all results of that type.
    if (!isFiltered) {
      spots = deduplicateByCuisine(spots);
    }

    return {
      spots,
      total: spots.length,
    };
  } catch (err) {
    console.error("Bites search error:", err);
    return {
      spots: [],
      total: 0,
      error: "Something went wrong. Try again.",
    };
  }
}
