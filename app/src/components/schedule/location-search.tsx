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
};

type MapboxFeature = {
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
};

export function LocationSearch({
  value,
  onChange,
  proximity,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
      if (!text.trim() || !token) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          access_token: token,
          limit: "5",
          types: "poi,address,place",
          language: "en",
        });
        if (proximity) {
          params.set("proximity", `${proximity.lng},${proximity.lat}`);
        }
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            text
          )}.json?${params}`
        );
        const data = await res.json();
        setResults(data.features ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token, proximity]
  );

  function handleInput(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  }

  function handleSelect(feature: MapboxFeature) {
    onChange({
      name: feature.text || feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
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
            onFocus={() => results.length > 0 && setOpen(true)}
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
      {open && results.length > 0 && (
        <div className="absolute left-[calc(40px+0.5rem)] right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {results.map((feature, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-accent-soft transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
            >
              <MapPin
                size={13}
                className="text-muted shrink-0 mt-0.5"
              />
              <span className="truncate">{feature.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
