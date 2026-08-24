"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Activity } from "@/lib/actions/activity";
import { CATEGORY_EMOJI } from "@/lib/categories";

type DayMapProps = {
  activities: Activity[];
};

export function DayMap({ activities }: DayMapProps) {
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
          const emoji = CATEGORY_EMOJI[activity.category] ?? "📌";

          // Create a custom marker element
          const el = document.createElement("div");
          el.className = "day-map-marker";
          el.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background: white;
              border: 2px solid #1a8a6e;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              font-size: 14px;
              cursor: pointer;
              position: relative;
            ">
              <span>${emoji}</span>
              <span style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #1a8a6e;
                color: white;
                font-size: 9px;
                font-weight: 700;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">${index + 1}</span>
            </div>
          `;

          // Build popup with safe text (no raw HTML injection)
          const popupEl = document.createElement("div");
          const titleEl = document.createElement("div");
          titleEl.style.cssText = "font-size:13px;font-weight:500;color:#1a1a1a;padding:2px 0;";
          titleEl.textContent = activity.title;
          popupEl.appendChild(titleEl);

          if (activity.time) {
            const timeEl = document.createElement("div");
            timeEl.style.cssText = "font-size:11px;color:#888;margin-top:2px;";
            timeEl.textContent = activity.time;
            popupEl.appendChild(timeEl);
          }
          if (activity.place_name) {
            const placeEl = document.createElement("div");
            placeEl.style.cssText = "font-size:11px;color:#888;margin-top:2px;";
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
  }, [expanded, mapKey]);

  // Don't render if no activities have locations
  if (locatedActivities.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted hover:text-ink transition-colors"
      >
        <span>
          📍 {locatedActivities.length} location
          {locatedActivities.length !== 1 ? "s" : ""} pinned
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Map */}
      {expanded && (
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[180px]"
          />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-ground">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
