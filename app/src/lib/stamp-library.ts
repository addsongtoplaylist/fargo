/**
 * Passport stamp library (docs/STAMPS.md v2.1): pre-made, owner-approved stamps shipped with the
 * app — no AI calls at runtime. Which stamp a trip gets:
 *   1. the place stamp whose area contains the trip's Base city (closest centre wins if areas
 *      overlap) — never a neighbouring place's stamp;
 *   2. otherwise one of the country's 2 country stamps, the same one every time for a trip;
 *   3. otherwise null → the plain ✈ ring.
 * Collecting (STAMPS.md v2.2) adds `chooseStamp()` on top: a stamp you already have gives way to a
 * country stamp you don't have yet. Stamp ids are permanent (they're saved in collected_stamps) —
 * never rename or reuse one.
 */
import { STAMPS } from "./stamp-library-data";

export type StampEntry =
  | { id: string; country: string; kind: "place"; name: string; areas: [number, number, number][]; aliases: string[]; file: string }
  | { id: string; country: string; kind: "country"; file: string };

export type Stamp = { id: string; file: string };

const normalise = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Great-circle distance in km. */
function km(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

/** Small stable hash so a trip always gets the same of its country's two stamps. */
function pick(tripId: string, n: number) {
  let h = 2166136261;
  for (let i = 0; i < tripId.length; i++) h = Math.imul(h ^ tripId.charCodeAt(i), 16777619);
  return (h >>> 0) % n;
}

export function stampFor(trip: {
  tripId: string;
  /** ISO country code of the destination */
  country: string | null;
  /** Base city coordinates — only these, never the country's centre */
  lat?: number | null;
  lng?: number | null;
  /** Base city name, used only when there are no coordinates */
  place?: string | null;
}): Stamp | null {
  const cc = trip.country?.toUpperCase();
  if (!cc) return null;
  const mine = STAMPS.filter((s) => s.country === cc);

  const places = mine.filter((s): s is Extract<StampEntry, { kind: "place" }> => s.kind === "place");
  if (trip.lat != null && trip.lng != null) {
    let best: { s: StampEntry; d: number } | null = null;
    for (const s of places) {
      for (const [lat, lng, radius] of s.areas) {
        const d = km(trip.lat, trip.lng, lat, lng);
        if (d <= radius && (!best || d < best.d)) best = { s, d };
      }
    }
    if (best) return { id: best.s.id, file: best.s.file };
  } else if (trip.place) {
    const want = normalise(trip.place);
    const hit = places.find((s) => normalise(s.name) === want || s.aliases.some((a) => normalise(a) === want));
    if (hit) return { id: hit.id, file: hit.file };
  }

  const country = mine.filter((s) => s.kind === "country").sort((a, b) => a.id.localeCompare(b.id));
  if (country.length === 0) return null;
  const s = country[pick(trip.tripId, country.length)];
  return { id: s.id, file: s.file };
}

/** The ✈ ring stamp's id — for a country without library stamps (C5). */
export const RING = "ring";

/** Image path for a stamp id ("/stamps/MY/penang.png"), or null for the ring / an unknown id. */
export function stampFile(id: string): string | null {
  return STAMPS.find((s) => s.id === id)?.file ?? null;
}

/**
 * The stamp a traveller collects for a trip (C3, C5), given the stamp ids they already have:
 * the trip's own stamp if new → else one of the country's stamps they don't have yet (this trip's
 * usual pick first) → else the trip's own stamp again (a duplicate, shown ×2). No library stamp
 * for the country → the ring.
 */
export function chooseStamp(trip: Parameters<typeof stampFor>[0], owned: Iterable<string>): string {
  const own = stampFor(trip);
  if (!own) return RING;
  const have = new Set(owned);
  if (!have.has(own.id)) return own.id;

  const cc = trip.country!.toUpperCase();
  const country = STAMPS.filter((s) => s.country === cc && s.kind === "country").sort((a, b) => a.id.localeCompare(b.id));
  const start = country.length ? pick(trip.tripId, country.length) : 0;
  for (let i = 0; i < country.length; i++) {
    const s = country[(start + i) % country.length];
    if (!have.has(s.id)) return s.id;
  }
  return own.id;
}
