"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Google Places lookups for the place search boxes (Add activity, Discover location).
 * They run here so the Google key never reaches the browser (REVIEW.md SEC-5):
 * Google doesn't enforce website restrictions on Places (New) calls, so a key in
 * the page could be copied and used anywhere. Signed-in users only.
 */

export type PlaceSuggestion = { placeId: string; main: string; secondary: string | null };
export type PlaceLocation = { name: string; lat: number; lng: number };

const PLACES = "https://places.googleapis.com/v1";

/** Signed-in check that verifies the session token (not just reads the cookie). */
async function signedIn() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return !!data?.claims?.sub;
}

function serverKey() {
  return process.env.GOOGLE_PLACES_SERVER_KEY ?? null;
}

const isCoord = (n: unknown, max: number) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= max;

export async function searchPlaces(params: {
  input: string;
  /** Bias results toward this point (the trip destination) */
  near?: { lat: number; lng: number };
  /** ISO 3166-1 alpha-2 country codes to restrict results */
  countries?: string[];
}): Promise<PlaceSuggestion[]> {
  const key = serverKey();
  const input = typeof params.input === "string" ? params.input.trim().slice(0, 120) : "";
  if (!key || !input || !(await signedIn())) return [];

  const body: Record<string, unknown> = { input, languageCode: "en" };
  if (params.near && isCoord(params.near.lat, 90) && isCoord(params.near.lng, 180)) {
    body.locationBias = {
      circle: { center: { latitude: params.near.lat, longitude: params.near.lng }, radius: 50000 },
    };
  }
  const countries = (params.countries ?? []).filter((c) => typeof c === "string" && /^[a-z]{2}$/i.test(c)).slice(0, 5);
  if (countries.length > 0) body.includedRegionCodes = countries.map((c) => c.toLowerCase());

  try {
    const res = await fetch(`${PLACES}/places:autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      suggestions?: {
        placePrediction?: {
          placeId: string;
          text: { text: string };
          structuredFormat?: { mainText: { text: string }; secondaryText?: { text: string } };
        };
      }[];
    };
    return (data.suggestions ?? []).flatMap(({ placePrediction: p }) =>
      p
        ? [{ placeId: p.placeId, main: p.structuredFormat?.mainText?.text ?? p.text.text, secondary: p.structuredFormat?.secondaryText?.text ?? null }]
        : []
    );
  } catch {
    return [];
  }
}

export async function getPlaceLocation(placeId: string): Promise<PlaceLocation | null> {
  const key = serverKey();
  // Place IDs are letters, digits, "-" and "_"; anything else never reaches the URL.
  if (!key || typeof placeId !== "string" || !/^[A-Za-z0-9_-]{1,300}$/.test(placeId) || !(await signedIn())) return null;

  try {
    const res = await fetch(`${PLACES}/places/${placeId}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,location" },
    });
    if (!res.ok) return null;
    const place = (await res.json()) as { displayName?: { text: string }; location?: { latitude: number; longitude: number } };
    if (!place.location) return null;
    return { name: place.displayName?.text ?? "", lat: place.location.latitude, lng: place.location.longitude };
  } catch {
    return null;
  }
}
