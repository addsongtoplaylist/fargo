"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

export type Destination = {
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "VN", "JP") */
  countryCode: string;
  lat: number;
  lng: number;
};

type DestinationSearchProps = {
  value: Destination | null;
  onChange: (dest: Destination | null) => void;
  /** Placeholder text */
  placeholder?: string;
};

type MapboxFeature = {
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string; short_code?: string }[];
  place_type: string[];
};

export function DestinationSearch({
  value,
  onChange,
  placeholder = "Search destination…",
}: DestinationSearchProps) {
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
          types: "country",
          language: "en",
        });
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?${params}`
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
    [token]
  );

  function handleInput(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  }

  function handleSelect(feature: MapboxFeature) {
    // Extract country name and ISO code from context
    const countryCtx = feature.context?.find((c) => c.id.startsWith("country"));
    const regionCtx = feature.context?.find((c) => c.id.startsWith("region"));
    const isCountry = feature.place_type.includes("country");
    const isRegion = feature.place_type.includes("region");
    const country = isCountry ? feature.text : countryCtx?.text ?? "";
    // Mapbox short_code for countries is lowercase ISO 3166-1 alpha-2 (e.g. "vn")
    const countryCode = isCountry
      ? (feature as any).properties?.short_code?.toUpperCase() ?? ""
      : countryCtx?.short_code?.toUpperCase() ?? "";

    // Build a clean display name: "City, Country" or "Region, Country"
    // instead of Mapbox's raw place_name which can be verbose
    // e.g. "Tokyo, Japan" instead of "Tokyo, Tokyo Prefecture, Japan"
    // e.g. "Malacca, Malaysia" instead of "Malacca, Malacca, Malaysia"
    const displayName = buildDisplayName(feature.text, regionCtx?.text, country, isCountry, isRegion);

    onChange({
      name: displayName,
      country,
      countryCode,
      lat: feature.center[1],
      lng: feature.center[0],
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  /** Build a clean "City, Country" display name from Mapbox parts. */
  function buildDisplayName(
    text: string,
    region: string | undefined,
    country: string,
    isCountry: boolean,
    isRegion: boolean,
  ): string {
    if (isCountry) return text; // "Japan"
    if (isRegion) return country ? `${text}, ${country}` : text; // "Tokyo, Japan"
    // place type — include region only if it differs from the place name
    if (region && region !== text && country) {
      return `${text}, ${country}`; // "Puchong, Malaysia" (skip region for brevity)
    }
    return country ? `${text}, ${country}` : text; // "Malacca, Malaysia"
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
  }

  // If a destination is selected, show it as a pill
  if (value) {
    return (
      <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 h-11">
        <MapPin size={14} className="text-accent shrink-0" />
        <span className="text-sm text-ink truncate flex-1">{value.name}</span>
        <button
          type="button"
          onClick={handleClear}
          className="text-muted hover:text-ink shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink placeholder:text-muted/50 outline-none focus:border-accent transition-colors pr-8"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin"
          />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {(() => {
            const seen = new Set<string>();
            return results.reduce<{ feature: MapboxFeature; label: string }[]>((acc, feature) => {
              const countryCtx = feature.context?.find((c) => c.id.startsWith("country"));
              const regionCtx = feature.context?.find((c) => c.id.startsWith("region"));
              const isCountry = feature.place_type.includes("country");
              const isRegion = feature.place_type.includes("region");
              const country = isCountry ? feature.text : countryCtx?.text ?? "";
              const label = buildDisplayName(feature.text, regionCtx?.text, country, isCountry, isRegion);
              if (seen.has(label)) return acc;
              seen.add(label);
              acc.push({ feature, label });
              return acc;
            }, []).map(({ feature, label }, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-3 py-2.5 text-sm text-ink hover:bg-accent-soft transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
              >
                <MapPin size={13} className="text-muted shrink-0 mt-0.5" />
                <span className="truncate">{label}</span>
              </button>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
