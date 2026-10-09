/**
 * Passport stamp artwork per place (v0.5.7): a cream ink stamp (rings +
 * illustration, transparent PNG) in src/assets/stamps/. Places without art
 * get rings drawn by Fargo with the country code in the middle. AI-drawn art
 * for more places is planned (see docs/STATUS.md).
 */
const ART: Record<string, string> = {
  "ho chi minh city": "src/assets/stamps/ho-chi-minh-city.png",
  saigon: "src/assets/stamps/ho-chi-minh-city.png",
};

/** Asset path for a place's stamp art, or null. */
export function stampArtFor(place: string): string | null {
  const key = place
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  return ART[key] ?? null;
}
