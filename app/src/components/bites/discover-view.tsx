"use client";

import { useState, useCallback } from "react";
import {
  Navigation,
  Loader2,
  UtensilsCrossed,
  ShoppingBag,
  Landmark,
  Search,
} from "lucide-react";
import { useTrip, useIsPlanner } from "@/lib/trip-context";
import { searchDiningSpots, type DiningSpot } from "@/lib/actions/bites";
import { DiningCard } from "@/components/bites/dining-card";
import { SpotDetail } from "@/components/bites/spot-detail";
import { LocationPicker } from "@/components/bites/location-picker";

type LocationMode = "near_me" | "custom";

type DiscoverCategory = "bites" | "shop" | "attractions";

const CATEGORIES: {
  value: DiscoverCategory;
  label: string;
  icon: typeof UtensilsCrossed;
  enabled: boolean;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    value: "bites",
    label: "Bites",
    icon: UtensilsCrossed,
    enabled: true,
    emptyTitle: "Find your next meal",
    emptyDescription: "Discover dining spots that match your preferences",
  },
  {
    value: "shop",
    label: "Shop",
    icon: ShoppingBag,
    enabled: false,
    emptyTitle: "Find nearby shops",
    emptyDescription: "Discover shopping spots around you",
  },
  {
    value: "attractions",
    label: "Attractions",
    icon: Landmark,
    enabled: false,
    emptyTitle: "Find nearby attractions",
    emptyDescription: "Discover sights and things to do",
  },
];

export function DiscoverView() {
  const trip = useTrip();
  const isPlanner = useIsPlanner();

  const [category, setCategory] = useState<DiscoverCategory>("bites");
  const [locationMode, setLocationMode] = useState<LocationMode>("near_me");
  const [customLocation, setCustomLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [allSpots, setAllSpots] = useState<DiningSpot[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<DiningSpot | null>(null);

  const currentCategory = CATEGORIES.find((c) => c.value === category)!;

  const spots = allSpots.slice(0, visibleCount);
  const hasMore = visibleCount < allSpots.length;

  const doSearch = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);

      const result = await searchDiningSpots({ lat, lng });

      if (result.error) {
        setError(result.error);
      } else {
        setAllSpots(result.spots);
        setVisibleCount(5);
      }

      setLoading(false);
      setSearched(true);
    },
    []
  );

  async function handleSearch() {
    if (locationMode === "near_me") {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          doSearch(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setLoading(false);
          setError(
            err.code === 1
              ? "Location access denied. Allow location or search a place instead."
              : "Could not get your location. Try searching a place instead."
          );
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else if (customLocation) {
      doSearch(customLocation.lat, customLocation.lng);
    }
  }

  function handleShowMore() {
    setVisibleCount((prev) => prev + 5);
  }

  function handleLocationModeChange(mode: LocationMode) {
    setLocationMode(mode);
    setAllSpots([]);
    setVisibleCount(5);
    setSearched(false);
    setError(null);
  }

  function handleCategoryChange(value: DiscoverCategory) {
    setCategory(value);
    // Reset results when switching category
    setAllSpots([]);
    setVisibleCount(5);
    setSearched(false);
    setError(null);
  }

  // Non-planner view
  if (!isPlanner) {
    return (
      <div className="px-4 py-12 text-center">
        <Search size={36} className="mx-auto text-muted mb-3" />
        <p className="text-sm text-muted">
          Only the trip planner can use Discover.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Category selector */}
      <div className="flex gap-2 mb-3" data-swipe-ignore>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => cat.enabled && handleCategoryChange(cat.value)}
              disabled={!cat.enabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                isActive
                  ? "border-accent bg-accent-soft text-accent font-medium"
                  : cat.enabled
                    ? "border-border text-muted hover:border-ink/30 hover:text-ink"
                    : "border-border text-muted/40 cursor-not-allowed"
              }`}
            >
              <Icon size={13} />
              {cat.label}
              {!cat.enabled && (
                <span className="text-[10px] text-muted/40">Soon</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Location toggle */}
      <LocationPicker
        mode={locationMode}
        customLocation={customLocation}
        onModeChange={handleLocationModeChange}
        onCustomLocationChange={setCustomLocation}
        tripDestination={trip?.destination ?? ""}
        countryCode={trip?.destination_country_code}
      />

      {/* Search / empty state */}
      {!searched && !loading && (
        <div className="text-center py-10">
          <currentCategory.icon size={36} className="mx-auto text-muted mb-3" />
          <p className="text-sm font-medium text-ink mb-1">
            {currentCategory.emptyTitle}
          </p>
          <p className="text-xs text-muted mb-4">
            {currentCategory.emptyDescription}
          </p>
          <button
            onClick={handleSearch}
            disabled={locationMode === "custom" && !customLocation}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Navigation size={14} />
            Search nearby
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10">
          <Loader2 size={24} className="mx-auto text-accent animate-spin mb-3" />
          <p className="text-xs text-muted">
            Finding the best spots near you…
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-6">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={handleSearch}
            className="text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {searched && !loading && spots.length > 0 && (
        <>
          <p className="text-xs text-muted mb-3">
            {allSpots.length} spot{allSpots.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-3">
            {spots.map((spot) => (
              <DiningCard
                key={spot.id}
                spot={spot}
                onTap={() => setSelectedSpot(spot)}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleShowMore}
              className="w-full mt-4 py-2.5 text-sm font-medium text-muted border border-border rounded-lg hover:border-ink/30 hover:text-ink transition-colors"
            >
              Show 5 more
            </button>
          )}

          {!hasMore && spots.length > 0 && (
            <p className="text-center text-xs text-muted mt-4 mb-2">
              That&apos;s all we found nearby
            </p>
          )}
        </>
      )}

      {/* No results */}
      {searched && !loading && !error && spots.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted mb-3">
            No spots found matching your preferences.
          </p>
          <button
            onClick={handleSearch}
            className="text-sm text-accent hover:underline"
          >
            Search again
          </button>
        </div>
      )}

      {/* Spot detail bottom sheet */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          tripId={trip?.id ?? ""}
          localCurrency={trip?.local_currency ?? ""}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </div>
  );
}
