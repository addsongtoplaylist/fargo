import { format, parseISO } from "date-fns";

/** "17 Sep – 24 Dec 2026" — the app's standard trip date range */
export function formatDateRange(start: string, end: string): string {
  return `${format(parseISO(start), "d MMM")} – ${format(parseISO(end), "d MMM yyyy")}`;
}

/** "17 Sep 2026" */
export function formatDate(date: string): string {
  return format(parseISO(date), "d MMM yyyy");
}
