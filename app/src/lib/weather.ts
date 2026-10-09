/**
 * Current temperature (°C) at a location via Open-Meteo — free, no API key.
 * Cached for 30 minutes. Returns null on any failure so the UI can hide it.
 */
export async function getCurrentTemperature(lat: number, lng: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`;
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    return typeof temp === "number" ? Math.round(temp) : null;
  } catch {
    return null;
  }
}

type StayLike = { date: string; category: string; place_lat: string | null; place_lng: string | null };

/**
 * Where to read the weather: while the trip runs, the latest Stay checked in
 * on or before today (a Stay lasts until the next one); otherwise the base
 * city. Before the trip starts: base city, else the first Stay.
 */
export function weatherLocation(
  activities: StayLike[],
  base: { lat: number | null; lng: number | null },
  today: string,
  started: boolean
): { lat: number; lng: number } | null {
  const stays = activities
    .filter((a) => a.category === "accommodation" && a.place_lat && a.place_lng)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pin = (a: StayLike) => ({ lat: Number(a.place_lat), lng: Number(a.place_lng) });
  const baseLoc = base.lat != null && base.lng != null ? { lat: base.lat, lng: base.lng } : null;

  if (!started) return baseLoc ?? (stays[0] ? pin(stays[0]) : null);
  const current = stays.filter((a) => a.date <= today).at(-1);
  return current ? pin(current) : baseLoc;
}

/**
 * Mean temperature (°C) at a place over a trip's dates, via Open-Meteo (free,
 * no key). Days more than 6 days ago come from the historical archive; recent
 * and upcoming days (up to 15 days ahead) from the forecast. Days further
 * ahead are skipped. Null when no day has data (e.g. a trip months away).
 */
export async function getMeanTemperature(
  lat: number,
  lng: number,
  start: string,
  end: string,
  today: string
): Promise<number | null> {
  const addDays = (d: string, n: number) => {
    const t = new Date(`${d}T00:00:00Z`);
    t.setUTCDate(t.getUTCDate() + n);
    return t.toISOString().slice(0, 10);
  };
  const archiveEnd = addDays(today, -7);
  const forecastEnd = addDays(today, 15);

  async function daily(base: string, from: string, to: string): Promise<number[]> {
    if (from > to) return [];
    try {
      const url = `${base}?latitude=${lat}&longitude=${lng}&start_date=${from}&end_date=${to}&daily=temperature_2m_mean&timezone=auto`;
      const res = await fetch(url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) });
      if (!res.ok) return [];
      const data = await res.json();
      const values: unknown[] = data?.daily?.temperature_2m_mean ?? [];
      return values.filter((v): v is number => typeof v === "number");
    } catch {
      return [];
    }
  }

  const [past, recent] = await Promise.all([
    daily("https://archive-api.open-meteo.com/v1/archive", start, end < archiveEnd ? end : archiveEnd),
    daily(
      "https://api.open-meteo.com/v1/forecast",
      start > archiveEnd ? start : addDays(archiveEnd, 1),
      end < forecastEnd ? end : forecastEnd
    ),
  ]);
  const all = [...past, ...recent];
  if (all.length === 0) return null;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}
