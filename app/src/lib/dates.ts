import { format, parseISO } from "date-fns";

/** "17 Sep – 24 Dec 2026" — the app's standard trip date range */
export function formatDateRange(start: string, end: string): string {
  return `${format(parseISO(start), "d MMM")} – ${format(parseISO(end), "d MMM yyyy")}`;
}

/** "17 Sep 2026" */
export function formatDate(date: string): string {
  return format(parseISO(date), "d MMM yyyy");
}

/** Map country code → IANA timezone (common destinations). */
export const COUNTRY_TIMEZONE: Record<string, string> = {
  US: "America/New_York",
  GB: "Europe/London",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  CN: "Asia/Shanghai",
  TW: "Asia/Taipei",
  HK: "Asia/Hong_Kong",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  VN: "Asia/Ho_Chi_Minh",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  IN: "Asia/Kolkata",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  CA: "America/Toronto",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  NL: "Europe/Amsterdam",
  CH: "Europe/Zurich",
  AE: "Asia/Dubai",
  TR: "Europe/Istanbul",
  BR: "America/Sao_Paulo",
  MX: "America/Mexico_City",
  PT: "Europe/Lisbon",
  AT: "Europe/Vienna",
  BE: "Europe/Brussels",
  IE: "Europe/Dublin",
  FI: "Europe/Helsinki",
  GR: "Europe/Athens",
};

const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";

/**
 * Today's date (yyyy-MM-dd) in the user's home timezone. Server code must use
 * this instead of new Date().toISOString(), which is UTC — a day behind for
 * Malaysia between midnight and 8am.
 */
export function todayForCountry(countryCode?: string | null): string {
  const tz = (countryCode && COUNTRY_TIMEZONE[countryCode]) || DEFAULT_TIMEZONE;
  // en-CA formats as yyyy-MM-dd
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}
