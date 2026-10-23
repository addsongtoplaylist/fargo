/**
 * What's on right now for an ongoing trip (home band card, v0.7.0).
 * Same rule as Overview: among today's timed activities, "now" is the last
 * one that has started; before the first one starts we show it as "next".
 * `today` / `nowTime` come from the destination (todayForCountry / nowTimeForCountry).
 */
export type NowItem = { title: string; time: string; tag: "now" | "next" };

export function nowForTrip(
  activities: { date: string; time: string | null; title: string }[],
  today: string,
  nowTime: string
): NowItem | null {
  const timed = activities
    .filter((a) => a.date === today && a.time)
    .sort((a, b) => a.time!.localeCompare(b.time!));
  if (timed.length === 0) return null;
  let current: (typeof timed)[number] | undefined;
  for (const a of timed) if (a.time!.slice(0, 5) <= nowTime) current = a;
  if (current) return { title: current.title, time: current.time!, tag: "now" };
  return { title: timed[0].title, time: timed[0].time!, tag: "next" };
}
