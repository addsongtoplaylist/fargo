"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { fieldClass } from "@/components/ui/field";
import { searchPlaces, getPlaceLocation, type PlaceSuggestion } from "@/lib/actions/places";

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
  /** ISO 3166-1 alpha-2 country codes to restrict results (e.g. ["VN", "MY"]) */
  countries?: string[];
};

export function LocationSearch({
  value,
  onChange,
  proximity,
  countries,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Google is called from the server (lib/actions/places.ts) so the key stays private
  const search = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        setSuggestions(await searchPlaces({ input: text, near: proximity, countries }));
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [proximity, countries]
  );

  function handleInput(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  }

  async function handleSelect(suggestion: PlaceSuggestion) {
    setLoading(true);
    try {
      // Place details (coordinates) come from the server too
      const place = await getPlaceLocation(suggestion.placeId);
      // Fallback: use suggestion text without coordinates
      onChange(place ? { ...place, name: place.name || suggestion.main } : { name: suggestion.main, lat: 0, lng: 0 });
    } catch {
      onChange({ name: suggestion.main, lat: 0, lng: 0 });
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
      <div className="flex items-center gap-2.5">
        <label className="text-[13px] text-fg-muted w-16 shrink-0">Place</label>
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-page border border-line rounded-field px-3 h-11">
          <MapPin size={14} className="text-brand shrink-0" />
          <span className="text-sm text-fg truncate flex-1">
            {value.name}
          </span>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear"
            className="w-8 h-8 -mr-2 flex items-center justify-center text-fg-faint hover:text-fg shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2.5">
        <label className="text-[13px] text-fg-muted w-16 shrink-0">Place</label>
        <div className="flex-1 min-w-0 relative">
          <input
            type="text"
            placeholder="Search location…"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className={`${fieldClass} pr-8`}
          />
          {loading && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted animate-spin"
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-[calc(64px+0.625rem)] right-0 top-full mt-1 bg-surface border border-line rounded-field shadow-float z-50 overflow-hidden">
          {suggestions.map((suggestion) => {
            const main = suggestion.main;
            const secondary = suggestion.secondary;
            return (
              <button
                key={suggestion.placeId}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-3 py-2.5 text-sm text-fg hover:bg-brand-soft transition-colors flex items-start gap-2 border-b border-line last:border-b-0"
              >
                <MapPin
                  size={13}
                  className="text-fg-muted shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="block truncate">{main}</span>
                  {secondary && (
                    <span className="block text-xs text-fg-muted truncate">{secondary}</span>
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
