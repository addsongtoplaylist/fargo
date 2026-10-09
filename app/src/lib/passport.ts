import { differenceInCalendarDays, parseISO } from "date-fns";
import { COUNTRY_TIMEZONE } from "@/lib/dates";

/**
 * Passport — travel stats from the trips you're on (v0.5.6). Pure maths, no
 * database: the page passes in trips + your home country. Only trips that
 * have started count; upcoming trips only feed the "next trip" countdown.
 */

export type PassportTrip = {
  id: string;
  name: string;
  destination: string;
  countryCode: string | null;
  /** Trip settings → Base city (e.g. "Penang") — shown on the stamp */
  baseCity: string | null;
  lat: number | null;
  lng: number | null;
  start_date: string;
  end_date: string;
  travellers: { display_name: string; account_id: string | null }[];
};

/** One stamp per trip that has started — like a passport stamp at every entry. */
export type PassportStamp = {
  tripId: string;
  /** City when the trip has a base city, else the country */
  place: string;
  /** Country under the city name (null when `place` is already the country) */
  country: string | null;
  countryCode: string | null;
  /** "SEP 2026" */
  month: string;
};

export type PassportStats = {
  stamps: PassportStamp[];
  /** Countries abroad only — your home country doesn't count (owner decision 2026-10-09) */
  countries: { code: string; name: string }[];
  trips: number;
  daysAway: number;
  daysThisYear: number;
  year: number;
  buddies: number;
  topBuddy: { name: string; trips: number } | null;
  furthest: { place: string; km: number } | null;
  timeDiff: { place: string; hours: number } | null;
  current: { name: string; day: number } | null;
  next: { name: string; inDays: number } | null;
  last: { name: string; daysAgo: number } | null;
};

/** Rough centre of each country we list (home countries + common destinations). */
const CENTROID: Record<string, [number, number]> = {
  MY: [4.2, 101.98], SG: [1.35, 103.82], TH: [15.87, 100.99], VN: [14.06, 108.28], ID: [-0.79, 113.92],
  PH: [12.88, 121.77], JP: [36.2, 138.25], KR: [35.91, 127.77], CN: [35.86, 104.2], TW: [23.7, 120.96],
  HK: [22.32, 114.17], IN: [20.59, 78.96], AU: [-25.27, 133.78], NZ: [-40.9, 174.89], GB: [55.38, -3.44],
  US: [37.09, -95.71], CA: [56.13, -106.35], DE: [51.17, 10.45], FR: [46.23, 2.21], IT: [41.87, 12.57],
  ES: [40.46, -3.75], NL: [52.13, 5.29], CH: [46.82, 8.23], AT: [47.52, 14.55], BE: [50.5, 4.47],
  PT: [39.4, -8.22], IE: [53.41, -8.24], GR: [39.07, 21.82], TR: [38.96, 35.24], AE: [23.42, 53.85],
  SA: [23.89, 45.08], BR: [-14.24, -51.93], MX: [23.63, -102.55], FI: [61.92, 25.75], SE: [60.13, 18.64],
  NO: [60.47, 8.47], DK: [56.26, 9.5], MV: [3.2, 73.22], LK: [7.87, 80.77], MM: [21.91, 95.96],
  KH: [12.57, 104.99], LA: [19.86, 102.5], BN: [4.54, 114.73],
};

/** Time zones for listed countries missing from COUNTRY_TIMEZONE. */
const EXTRA_TIMEZONE: Record<string, string> = {
  SA: "Asia/Riyadh", SE: "Europe/Stockholm", NO: "Europe/Oslo", DK: "Europe/Copenhagen",
  MV: "Indian/Maldives", LK: "Asia/Colombo", MM: "Asia/Yangon", KH: "Asia/Phnom_Penh",
  LA: "Asia/Vientiane", BN: "Asia/Brunei",
};

function timeZoneFor(code: string | null): string | null {
  if (!code) return null;
  return COUNTRY_TIMEZONE[code] ?? EXTRA_TIMEZONE[code] ?? null;
}

/** Hours ahead of UTC in a time zone right now (e.g. 8 for Kuala Lumpur, 5.5 for Colombo). */
function utcOffsetHours(timeZone: string): number | null {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    if (!part || part === "GMT") return 0;
    const m = part.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return null;
    const hours = Number(m[2]) + (m[3] ? Number(m[3]) / 60 : 0);
    return m[1] === "-" ? -hours : hours;
  } catch {
    return null;
  }
}

/** Great-circle distance in km. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Inclusive day count of the part of [start, end] that falls inside [from, to]. */
function overlapDays(start: string, end: string, from: string, to: string): number {
  const s = start > from ? start : from;
  const e = end < to ? end : to;
  if (e < s) return 0;
  return differenceInCalendarDays(parseISO(e), parseISO(s)) + 1;
}

/** Straight-line km from your home country's centre to a trip (its location, else its country's centre). */
export function kmFromHome(
  homeCountryCode: string | null | undefined,
  lat: number | null,
  lng: number | null,
  countryCode: string | null
): number | null {
  const home = homeCountryCode ? CENTROID[homeCountryCode] : undefined;
  const point: [number, number] | undefined =
    lat != null && lng != null ? [lat, lng] : countryCode ? CENTROID[countryCode] : undefined;
  if (!home || !point) return null;
  return Math.round(distanceKm(home, point));
}

/** Rough centre of a country we list, for places without saved coordinates. */
export function countryCentre(code: string | null | undefined): [number, number] | null {
  return (code && CENTROID[code]) || null;
}

export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function computePassport(
  trips: PassportTrip[],
  me: { accountId: string; homeCountryCode: string | null },
  today: string
): PassportStats {
  const started = trips.filter((t) => t.start_date <= today);
  const year = Number(today.slice(0, 4));

  // Stamps — newest first
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const stamps: PassportStamp[] = [...started]
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .map((t) => {
      const countryLabel = t.countryCode ? countryName(t.countryCode) : t.destination;
      const city = t.baseCity?.split(",")[0].trim() || null;
      return {
        tripId: t.id,
        place: city ?? countryLabel,
        country: city ? countryLabel : null,
        countryCode: t.countryCode,
        month: `${MONTHS[Number(t.start_date.slice(5, 7)) - 1]} ${t.start_date.slice(0, 4)}`,
      };
    });

  // Countries — one per trip (its destination country), abroad only
  const codes = [
    ...new Set(started.map((t) => t.countryCode).filter((c): c is string => !!c && c !== me.homeCountryCode)),
  ];
  const countries = codes.map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));

  // Days away — up to today for a trip that's still going
  let daysAway = 0;
  let daysThisYear = 0;
  for (const t of started) {
    daysAway += overlapDays(t.start_date, t.end_date, t.start_date, today);
    daysThisYear += overlapDays(t.start_date, t.end_date, `${year}-01-01`, today);
  }

  // Travel buddies — everyone else on your trips, name-only travellers too
  const buddyTrips = new Map<string, { name: string; trips: number }>();
  for (const t of started) {
    const seen = new Set<string>();
    for (const p of t.travellers) {
      if (p.account_id === me.accountId) continue;
      const key = p.account_id ? `a:${p.account_id}` : `n:${p.display_name.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = buddyTrips.get(key) ?? { name: p.display_name, trips: 0 };
      entry.trips += 1;
      buddyTrips.set(key, entry);
    }
  }
  const topBuddy = [...buddyTrips.values()].sort((a, b) => b.trips - a.trips)[0] ?? null;

  // Furthest from home — trip location, else its country's centre
  const home = me.homeCountryCode ? CENTROID[me.homeCountryCode] : undefined;
  let furthest: PassportStats["furthest"] = null;
  if (home) {
    for (const t of started) {
      const point: [number, number] | undefined =
        t.lat != null && t.lng != null ? [t.lat, t.lng] : t.countryCode ? CENTROID[t.countryCode] : undefined;
      if (!point) continue;
      const km = Math.round(distanceKm(home, point));
      if (!furthest || km > furthest.km) furthest = { place: t.destination, km };
    }
  }

  // Biggest time difference from home (largest either way)
  const homeZone = timeZoneFor(me.homeCountryCode);
  const homeOffset = homeZone ? utcOffsetHours(homeZone) : null;
  let timeDiff: PassportStats["timeDiff"] = null;
  if (homeOffset != null) {
    for (const t of started) {
      const zone = timeZoneFor(t.countryCode);
      const offset = zone ? utcOffsetHours(zone) : null;
      if (offset == null) continue;
      const hours = offset - homeOffset;
      if (hours !== 0 && (!timeDiff || Math.abs(hours) > Math.abs(timeDiff.hours))) {
        timeDiff = { place: t.destination, hours };
      }
    }
  }

  // Now / next / last
  const currentTrip = started
    .filter((t) => t.end_date >= today)
    .sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
  const nextTrip = trips.filter((t) => t.start_date > today).sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
  const lastTrip = trips.filter((t) => t.end_date < today).sort((a, b) => b.end_date.localeCompare(a.end_date))[0];

  return {
    stamps,
    countries,
    trips: started.length,
    daysAway,
    daysThisYear,
    year,
    buddies: buddyTrips.size,
    topBuddy: topBuddy && topBuddy.trips > 0 ? topBuddy : null,
    furthest,
    timeDiff,
    current: currentTrip
      ? { name: currentTrip.name, day: differenceInCalendarDays(parseISO(today), parseISO(currentTrip.start_date)) + 1 }
      : null,
    next: nextTrip ? { name: nextTrip.name, inDays: differenceInCalendarDays(parseISO(nextTrip.start_date), parseISO(today)) } : null,
    last: lastTrip ? { name: lastTrip.name, daysAgo: differenceInCalendarDays(parseISO(today), parseISO(lastTrip.end_date)) } : null,
  };
}
