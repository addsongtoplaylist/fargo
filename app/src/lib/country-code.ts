/**
 * Destination name → 2-letter country code, for the no-photo trip cover.
 * Destinations are country names (the destination search is country-only);
 * older text like "Hanoi, Vietnam" uses the last part. Built from the
 * runtime's country list, so no table to maintain. Retire once
 * get_my_trips returns the stored code (redesign P10).
 */
let byName: Map<string, string> | null = null;

const ALIASES: Record<string, string> = {
  turkey: "TR",
  "hong kong": "HK",
  macau: "MO",
  macao: "MO",
  "south korea": "KR",
  korea: "KR",
  "north korea": "KP",
  usa: "US",
  "united states of america": "US",
  uk: "GB",
  "czech republic": "CZ",
  "viet nam": "VN",
  myanmar: "MM",
  burma: "MM",
};

/** Skip retired codes (e.g. VD "North Vietnam" → VN) so each name maps to today's code. */
function isCurrent(code: string) {
  try {
    return Intl.getCanonicalLocales(`und-${code}`)[0].split("-")[1] === code;
  } catch {
    return false;
  }
}

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function table(): Map<string, string> {
  if (byName) return byName;
  byName = new Map(Object.entries(ALIASES));
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const A = 65;
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(A + i, A + j);
      const name = names.of(code);
      if (name && name !== code && isCurrent(code) && !byName.has(norm(name))) byName.set(norm(name), code);
    }
  }
  return byName;
}

export function countryCode(destination: string | null | undefined): string | null {
  if (!destination) return null;
  const last = destination.split(",").pop() ?? "";
  return table().get(norm(last)) ?? null;
}
