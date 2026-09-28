"use client";

import { useRef, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import type { Activity } from "@/lib/actions/activity";

/**
 * Stored category → v0.8 category colour (DESIGN.md → Category colours;
 * same hex as the `cat-*` tokens — pins are plain DOM, not Tailwind).
 */
const PIN_COLOUR: Record<string, string> = {
  accommodation: "#6446c2",
  food: "#a9531a",
  transport: "#1f7068",
  activities: "#0071bc",
  shopping: "#a8365f",
  flights: "#2d5da8",
  misc: "#4a5264",
};

type DayMapProps = {
  activities: Activity[];
  /** The "now" activity on today's list — its pin is haloed */
  currentId?: string | null;
};

/**
 * Day map card (DESIGN.md v0.8): pins in category colours with their order
 * number, current stop haloed, tap a pin for title/time/place, Show/Hide.
 * Hidden when the day has no places.
 */
export function DayMap({ activities, currentId = null }: DayMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Filter to activities that have coordinates
  const locatedActivities = activities.filter(
    (a) => a.place_lat && a.place_lng
  );

  // Stable fingerprint so the map re-inits when locations change, not just count
  const mapKey = locatedActivities
    .map((a) => `${a.id}:${a.place_lat}:${a.place_lng}`)
    .join(",");

  useEffect(() => {
    if (!expanded || !mapContainerRef.current || locatedActivities.length === 0)
      return;

    let map: mapboxgl.Map;
    let mounted = true;

    async function initMap() {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      if (!mounted || !mapContainerRef.current) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        accessToken: token,
        attributionControl: false,
        interactive: true,
      });

      // Add compact attribution
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Disable scroll zoom on the inline map (too easy to trigger accidentally)
      map.scrollZoom.disable();

      mapRef.current = map;

      map.on("load", () => {
        if (!mounted) return;
        setMapReady(true);

        // Add markers
        const bounds = new mapboxgl.LngLatBounds();

        locatedActivities.forEach((activity, index) => {
          const lat = parseFloat(activity.place_lat!);
          const lng = parseFloat(activity.place_lng!);
          const colour = PIN_COLOUR[activity.category] ?? PIN_COLOUR.misc;
          const isCurrent = activity.id === currentId;

          // Custom marker: category-coloured pin with its order number;
          // the current stop gets a soft brand halo
          const el = document.createElement("div");
          el.className = "day-map-marker";
          el.style.cssText = [
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "width:28px",
            "height:28px",
            `background:${colour}`,
            "color:#fff",
            "border:2px solid #fff",
            "border-radius:50%",
            "font-size:12px",
            "font-weight:700",
            "cursor:pointer",
            isCurrent
              ? "box-shadow:0 0 0 5px rgba(0,113,188,0.28),0 2px 6px rgba(23,32,51,0.25)"
              : "box-shadow:0 2px 6px rgba(23,32,51,0.25)",
          ].join(";");
          el.textContent = String(index + 1);

          // Build popup with safe text (no raw HTML injection)
          const popupEl = document.createElement("div");
          const titleEl = document.createElement("div");
          titleEl.style.cssText = "font-size:13px;font-weight:600;color:#172033;padding:2px 0;";
          titleEl.textContent = activity.title;
          popupEl.appendChild(titleEl);

          if (activity.time) {
            const timeEl = document.createElement("div");
            timeEl.style.cssText = "font-size:12px;color:#5b6475;margin-top:2px;";
            timeEl.textContent = activity.time;
            popupEl.appendChild(timeEl);
          }
          if (activity.place_name) {
            const placeEl = document.createElement("div");
            placeEl.style.cssText = "font-size:12px;color:#5b6475;margin-top:2px;";
            placeEl.textContent = activity.place_name;
            popupEl.appendChild(placeEl);
          }

          const popup = new mapboxgl.Popup({
            offset: 20,
            closeButton: false,
            maxWidth: "200px",
          }).setDOMContent(popupEl);

          new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);

          bounds.extend([lng, lat]);
        });

        // Fit map to show all markers
        if (locatedActivities.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(14);
        } else {
          map.fitBounds(bounds, {
            padding: 40,
            maxZoom: 15,
          });
        }
      });
    }

    initMap();

    return () => {
      mounted = false;
      if (map) map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, mapKey, currentId]);

  // Don't render if no activities have locations
  if (locatedActivities.length === 0) return null;

  const count = locatedActivities.length;

  return (
    <div className="bg-surface rounded-card overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg-muted">
          <MapPin size={15} strokeWidth={2} className="text-brand" aria-hidden />
          {count} place{count !== 1 ? "s" : ""} on the map
        </p>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="text-[13px] font-semibold text-brand hover:text-brand-hover py-2"
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      {expanded && (
        <div className="relative px-2 pb-2">
          <div ref={mapContainerRef} className="w-full h-[180px] rounded-[12px] overflow-hidden" />
          {!mapReady && (
            <div className="absolute inset-x-2 top-0 bottom-2 rounded-[12px] flex items-center justify-center bg-skeleton">
              <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
