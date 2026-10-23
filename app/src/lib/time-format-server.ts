import { cookies } from "next/headers";
import { parseTimeFormat, TIME_FORMAT_COOKIE, type TimeFormat } from "@/lib/time-format";

/** The device's time format (server components only). */
export async function getTimeFormat(): Promise<TimeFormat> {
  const store = await cookies();
  return parseTimeFormat(store.get(TIME_FORMAT_COOKIE)?.value);
}
