import { tintFor } from "@/components/trip-cover";
import type { PassportStamp as Stamp } from "@/lib/passport";

/** Stable per-trip number, so a stamp keeps its tilt and shape. */
function hashOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const TILTS = [-9, 6, -4, 8, -6, 3];

/** "SEP 2026" → "Sep 26" */
function shortMonth(month: string) {
  const [m, y] = month.split(" ");
  return `${m.charAt(0)}${m.slice(1).toLowerCase()} ${y.slice(2)}`;
}

/**
 * Passport stamp (v0.5.6): an ink stamp — dashed round or rounded-square
 * outline in the trip's colour, slightly tilted, place + month inside.
 * AI-drawn stamp art is planned for v0.6.0.
 */
export function PassportStamp({ stamp }: { stamp: Stamp }) {
  const h = hashOf(stamp.tripId);
  const ink = tintFor(stamp.tripId).split(" ").find((c) => c.startsWith("text-")) ?? "text-fg";
  const round = h % 2 === 0;
  return (
    <div
      className={`w-[76px] h-[76px] shrink-0 border-2 border-dashed border-current flex flex-col items-center justify-center text-center px-1.5 ${ink} ${
        round ? "rounded-full" : "rounded-[18px]"
      }`}
      style={{ transform: `rotate(${TILTS[h % TILTS.length]}deg)` }}
      title={stamp.country ? `${stamp.place}, ${stamp.country}` : stamp.place}
    >
      <span className="text-[11px] font-bold leading-[1.15] line-clamp-2 break-words">{stamp.place}</span>
      <span className="text-[11px] font-medium mt-0.5 opacity-80">{shortMonth(stamp.month)}</span>
    </div>
  );
}

/** Faded "next stamp" placeholder at the end of the collection. */
export function NextStamp() {
  return (
    <div
      aria-hidden
      className="w-[76px] h-[76px] shrink-0 border-2 border-dashed border-[#d9cdb6] rounded-[18px] flex items-center justify-center text-[12px] font-medium text-[#b3a487]"
      style={{ transform: "rotate(4deg)" }}
    >
      + next
    </div>
  );
}

/** The cream "passport page" the stamps sit on. */
export const PASSPORT_PAGE = "bg-[#f6efe2] rounded-card";
