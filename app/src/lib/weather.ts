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
