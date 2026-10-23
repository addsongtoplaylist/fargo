/**
 * Time format preference (Profile → Time format). Saved per device in a cookie
 * so server pages (Overview) and client components show the same format.
 * Activity times are stored as "HH:mm"; this only changes how they're shown.
 */
export type TimeFormat = "24h" | "12h";

export const TIME_FORMAT_COOKIE = "fargo_time_format";

export function parseTimeFormat(value: string | undefined | null): TimeFormat {
  return value === "12h" ? "12h" : "24h";
}

/** "19:00" → "19:00" (24h) or "7:00 PM" (12h). Anything unparseable is returned as is. */
export function formatTime(time: string | null | undefined, fmt: TimeFormat): string {
  if (!time) return "";
  const hhmm = time.slice(0, 5);
  if (fmt === "24h") return hhmm;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return time;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

/** Width of a time column that fits "11:30 PM" on one line in 12h mode. */
export function timeColumnClass(fmt: TimeFormat): string {
  return fmt === "12h" ? "w-[64px] whitespace-nowrap" : "w-[42px]";
}
