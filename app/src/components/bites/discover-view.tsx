"use client";

import { useState, useCallback } from "react";
import {
  Navigation,
  Loader2,
  UtensilsCrossed,
  ShoppingBag,
  Landmark,
  Compass,
  AlertCircle,
  SearchX,
} from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { useTrip, useIsPlanner } from "@/lib/trip-context";
import { searchDiningSpots, type DiningSpot } from "@/lib/actions/bites";
import { FILTER_TYPES } from "@/lib/bites-filters";
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
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<DiningSpot | null>(null);
  // Track last search coords so filter changes can re-search
  const [lastCoords, setLastCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const currentCategory = CATEGORIES.find((c) => c.value === category)!;

  const spots = allSpots.slice(0, visibleCount);
  const hasMore = visibleCount < allSpots.length;

  const doSearch = useCallback(
    async (lat: number, lng: number, filter: string = "all") => {
      setLoading(true);
      setError(null);
      setLastCoords({ lat, lng });

      const result = await searchDiningSpots({ lat, lng, filterType: filter });

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
          doSearch(pos.coords.latitude, pos.coords.longitude, filterType);
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
      doSearch(customLocation.lat, customLocation.lng, filterType);
    }
  }

  function handleFilterChange(key: string) {
    if (key === filterType) return;
    setFilterType(key);
    // Re-search with the new filter using last known coords
    if (lastCoords) {
      doSearch(lastCoords.lat, lastCoords.lng, key);
    }
  }

  function handleShowMore() {
    setVisibleCount((prev) => prev + 5);
  }

  function handleLocationModeChange(mode: LocationMode) {
    setLocationMode(mode);
    setAllSpots([]);
    setVisibleCount(5);
    setFilterType("all");
    setSearched(false);
    setError(null);
    setLastCoords(null);
  }

  function handleCategoryChange(value: DiscoverCategory) {
    setCategory(value);
    // Reset results when switching category
    setAllSpots([]);
    setVisibleCount(5);
    setFilterType("all");
    setSearched(false);
    setError(null);
    setLastCoords(null);
  }

  // Non-planner view (B1)
  if (!isPlanner) {
    return (
      <div className="px-4 pt-2">
        <div className="bg-surface rounded-card">
          <Empty icon={Compass} message="Only the trip planner can use Discover." />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Category selector */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none" data-swipe-ignore>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            selected={category === cat.value}
            icon={cat.icon}
            disabled={!cat.enabled}
            onClick={() => cat.enabled && handleCategoryChange(cat.value)}
            trailing={!cat.enabled ? <span className="text-[11px] text-fg-muted">Soon</span> : undefined}
          >
            {cat.label}
          </Chip>
        ))}
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

      {/* Start state */}
      {!searched && !loading && !error && (
        <div className="bg-surface rounded-card">
          <Empty
            icon={currentCategory.icon}
            title={currentCategory.emptyTitle}
            message={currentCategory.emptyDescription}
            action={
              <Button
                icon={Navigation}
                onClick={handleSearch}
                disabled={locationMode === "custom" && !customLocation}
              >
                Search nearby
              </Button>
            }
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-surface rounded-card py-10 text-center">
          <Loader2 size={26} className="mx-auto text-brand animate-spin mb-3" aria-hidden />
          <p className="text-sm text-fg-muted">Finding the best spots near you…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-surface rounded-card py-8 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-money-over-soft text-money-over flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} strokeWidth={1.9} aria-hidden />
          </div>
          <p className="text-sm text-fg mb-3 max-w-[280px] mx-auto">{error}</p>
          <Button variant="soft" size="sm" onClick={handleSearch}>
            Try again
          </Button>
        </div>
      )}

      {/* Filter chips — shown after any search */}
      {searched && !loading && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-3 -mx-4 px-4" data-swipe-ignore>
          {FILTER_TYPES.map((f) => (
            <Chip key={f.key} selected={filterType === f.key} onClick={() => handleFilterChange(f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>
      )}

      {/* Results */}
      {searched && !loading && spots.length > 0 && (
        <>
          <p className="text-[13px] text-fg-muted mb-2 px-1">
            {allSpots.length} spot{allSpots.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2.5">
            {spots.map((spot) => (
              <DiningCard key={spot.id} spot={spot} onTap={() => setSelectedSpot(spot)} />
            ))}
          </div>

          {hasMore && (
            <Button variant="quiet" full className="mt-4" onClick={handleShowMore}>
              Show more
            </Button>
          )}

          {!hasMore && spots.length > 0 && (
            <p className="text-center text-[13px] text-fg-muted mt-4 mb-2">That&apos;s all we found nearby</p>
          )}
        </>
      )}

      {/* No results */}
      {searched && !loading && !error && spots.length === 0 && (
        <div className="bg-surface rounded-card">
          <Empty
            icon={SearchX}
            message={`No ${filterType !== "all" ? FILTER_TYPES.find((f) => f.key === filterType)?.label?.toLowerCase() + " " : ""}spots found nearby.`}
            action={
              filterType !== "all" ? (
                <Button variant="soft" size="sm" onClick={() => handleFilterChange("all")}>
                  Show all types
                </Button>
              ) : undefined
            }
          />
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
