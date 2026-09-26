"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";

type LocationMode = "near_me" | "custom";

type LocationPickerProps = {
  mode: LocationMode;
  customLocation: { name: string; lat: number; lng: number } | null;
  onModeChange: (mode: LocationMode) => void;
  onCustomLocationChange: (
    loc: { name: string; lat: number; lng: number } | null
  ) => void;
  tripDestination: string;
  /** ISO 3166-1 alpha-2 country code to restrict location search */
  countryCode?: string | null;
};

type GoogleSuggestion = {
  placePrediction?: {
    placeId: string;
    text: { text: string };
    structuredFormat?: {
      mainText: { text: string };
      secondaryText?: { text: string };
    };
  };
};

type GooglePlace = {
  displayName: { text: string };
  location: { latitude: number; longitude: number };
};

export function LocationPicker({
  mode,
  customLocation,
  onModeChange,
  onCustomLocationChange,
  tripDestination,
  countryCode,
}: LocationPickerProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GoogleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSearch(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(
    async (text: string) => {
      if (!text.trim() || !apiKey) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          "https://places.googleapis.com/v1/places:autocomplete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
            },
            body: JSON.stringify({
              input: text,
              languageCode: "en",
              ...(countryCode
                ? { includedRegionCodes: [countryCode.toUpperCase()] }
                : {}),
            }),
          }
        );
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, countryCode]
  );

  function handleInput(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  }

  async function handleSelect(suggestion: GoogleSuggestion) {
    const placeId = suggestion.placePrediction?.placeId;
    if (!placeId || !apiKey) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "displayName,location",
          },
        }
      );
      const place: GooglePlace = await res.json();

      onModeChange("custom");
      onCustomLocationChange({
        name:
          place.displayName?.text ??
          suggestion.placePrediction?.structuredFormat?.mainText?.text ??
          "",
        lat: place.location.latitude,
        lng: place.location.longitude,
      });
    } catch {
      // ignore
    } finally {
      setQuery("");
      setSuggestions([]);
      setShowSearch(false);
      setLoading(false);
    }
  }

  function handleSwitchToNearMe() {
    onModeChange("near_me");
    onCustomLocationChange(null);
    setShowSearch(false);
    setQuery("");
    setSuggestions([]);
  }

  function handleShowSearch() {
    setShowSearch(true);
    setQuery("");
  }

  // "Near me" mode
  if (mode === "near_me" && !showSearch) {
    return (
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 mb-4">
        <Navigation size={14} className="text-accent shrink-0" />
        <span className="text-sm text-ink font-medium flex-1">Near me</span>
        <button
          onClick={handleShowSearch}
          className="text-xs text-accent hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  // "Custom" mode — selected location
  if (mode === "custom" && customLocation && !showSearch) {
    return (
      <div className="flex items-center gap-2 bg-card border border-accent/30 rounded-lg px-3 py-2.5 mb-4">
        <MapPin size={14} className="text-accent shrink-0" />
        <span className="text-sm text-ink font-medium flex-1 truncate">
          {customLocation.name}
        </span>
        <button
          onClick={handleShowSearch}
          className="text-xs text-accent hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  // Search input mode
  return (
    <div ref={containerRef} className="relative mb-4">
      <div className="flex items-center gap-2 bg-card border-2 border-accent rounded-lg px-3 py-2">
        <MapPin size={14} className="text-accent shrink-0" />
        <input
          type="text"
          placeholder={`Search near ${tripDestination || "a place"}…`}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          autoFocus
          className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-muted/50"
        />
        {loading && (
          <Loader2 size={14} className="text-muted animate-spin shrink-0" />
        )}
        <button
          aria-label="Clear location"
          onClick={() => {
            setShowSearch(false);
            setSuggestions([]);
          }}
          className="text-muted hover:text-ink shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => {
            const pred = s.placePrediction;
            if (!pred) return null;
            const main =
              pred.structuredFormat?.mainText?.text ?? pred.text.text;
            const secondary = pred.structuredFormat?.secondaryText?.text;
            return (
              <button
                key={pred.placeId || i}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-accent-soft transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
              >
                <MapPin size={12} className="text-muted shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block truncate">{main}</span>
                  {secondary && (
                    <span className="block text-xs text-muted truncate">
                      {secondary}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Switch back to near me */}
      <button
        onClick={handleSwitchToNearMe}
        className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-accent hover:underline"
      >
        <Navigation size={11} />
        Use my location instead
      </button>
    </div>
  );
}
