"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

type Place = {
  name: string;
  lat: number;
  lng: number;
};

type LocationSearchProps = {
  value: Place | null;
  onChange: (place: Place | null) => void;
  /** Bias results toward the trip destination */
  proximity?: { lat: number; lng: number };
  /** ISO 3166-1 alpha-2 country code to restrict results (e.g. "VN") */
  country?: string;
};

type GooglePlace = {
  displayName: { text: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  id: string;
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

export function LocationSearch({
  value,
  onChange,
  proximity,
  country,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GoogleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
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
        const body: Record<string, unknown> = {
          input: text,
          languageCode: "en",
        };

        // Bias toward trip destination
        if (proximity) {
          body.locationBias = {
            circle: {
              center: { latitude: proximity.lat, longitude: proximity.lng },
              radius: 50000, // 50km radius
            },
          };
        }

        // Restrict to country if available
        if (country) {
          body.includedRegionCodes = [country.toLowerCase()];
        }

        const res = await fetch(
          "https://places.googleapis.com/v1/places:autocomplete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
            },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, proximity, country]
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
      // Fetch place details to get coordinates
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "displayName,location,formattedAddress",
          },
        }
      );
      const place: GooglePlace = await res.json();

      onChange({
        name: place.displayName?.text ?? suggestion.placePrediction?.structuredFormat?.mainText?.text ?? "",
        lat: place.location.latitude,
        lng: place.location.longitude,
      });
    } catch {
      // Fallback: use suggestion text without coordinates
      onChange({
        name: suggestion.placePrediction?.structuredFormat?.mainText?.text ?? "",
        lat: 0,
        lng: 0,
      });
    } finally {
      setQuery("");
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
    }
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setSuggestions([]);
  }

  // If a location is selected, show it as a pill
  if (value) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted w-10">Place</label>
        <div className="flex-1 flex items-center gap-1.5 bg-ground border border-border rounded-md px-2 py-1.5">
          <MapPin size={12} className="text-accent shrink-0" />
          <span className="text-sm text-ink truncate flex-1">
            {value.name}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted hover:text-ink shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted w-10">Place</label>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search location…"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className="w-full bg-ground border border-border rounded-md px-2 py-1.5 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors pr-7"
          />
          {loading && (
            <Loader2
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted animate-spin"
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-[calc(40px+0.5rem)] right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion, i) => {
            const pred = suggestion.placePrediction;
            if (!pred) return null;
            const main = pred.structuredFormat?.mainText?.text ?? pred.text.text;
            const secondary = pred.structuredFormat?.secondaryText?.text;
            return (
              <button
                key={pred.placeId || i}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-accent-soft transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
              >
                <MapPin
                  size={13}
                  className="text-muted shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="block truncate">{main}</span>
                  {secondary && (
                    <span className="block text-xs text-muted truncate">{secondary}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
