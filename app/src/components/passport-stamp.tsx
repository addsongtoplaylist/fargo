import Image from "next/image";
import { Plane } from "lucide-react";
import { tintFor } from "@/components/trip-cover";
import type { PassportStamp as Stamp } from "@/lib/passport";

/** Stable number per key, so a stamp keeps its tilt and shape. */
export function hashOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const TILTS = [-9, 6, -4, 8, -6, 3];
export const tiltFor = (key: string) => TILTS[hashOf(key) % TILTS.length];

/** Library stamp ink (STAMPS.md: one teal for the whole set) — the ✈ ring uses it too. */
const STAMP_INK = "#065E6B";

/** "SEP 2026" → "Sep 26" */
function shortMonth(month: string) {
  const [m, y] = month.split(" ");
  return `${m.charAt(0)}${m.slice(1).toLowerCase()} ${y.slice(2)}`;
}

/**
 * A collected stamp's artwork: the library image, or the ✈ ring (place + month) for a country
 * without library stamps. Not tilted — the caller tilts it.
 */
export function StampArt({ file, place, month, size }: { file: string | null; place: string; month: string; size: number }) {
  if (file) {
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image src={file} alt={`${place} stamp`} fill sizes={`${size}px`} className="object-contain" />
      </div>
    );
  }
  return (
    <div
      className="shrink-0 rounded-full flex flex-col items-center justify-center text-center"
      style={{ width: size, height: size, color: STAMP_INK, border: `${Math.max(2, size / 30)}px solid`, outline: "1.5px solid", outlineOffset: -size / 9 }}
      role="img"
      aria-label={`${place} stamp`}
    >
      <Plane size={size * 0.24} strokeWidth={2} aria-hidden />
      <span className="font-bold leading-[1.1] line-clamp-1 break-all px-2" style={{ fontSize: Math.max(9, size * 0.13), maxWidth: size * 0.72 }}>
        {place.toUpperCase()}
      </span>
      <span className="font-medium opacity-80" style={{ fontSize: Math.max(8, size * 0.11) }}>
        {shortMonth(month)}
      </span>
    </div>
  );
}

/**
 * One spot on the Passport page (v0.5.6; collecting v0.5.17, STAMPS.md v2.2):
 * - collected → the stamp art, slightly tilted, ×2 when you have it more than once;
 * - ready / in progress / upcoming → a dashed outline in the trip's colour with place + month,
 *   fainter the further away it is. Ready ones say "Collect" (the row above the grid collects).
 */
export function PassportStamp({ stamp }: { stamp: Stamp }) {
  const tilt = tiltFor(stamp.key);
  const label = stamp.countryCode ? `${stamp.place} · ${stamp.month}` : stamp.place;

  if (stamp.state === "collected") {
    return (
      <div className="relative w-[76px] h-[76px] flex items-center justify-center" title={label}>
        <div style={{ transform: `rotate(${tilt}deg)` }}>
          <StampArt file={stamp.file} place={stamp.place} month={stamp.month} size={76} />
        </div>
        {stamp.count > 1 && (
          <span className="absolute -top-1 -right-1 bg-[#5b4a2e] text-white text-[10px] font-bold rounded-full px-1.5 py-px tabular-nums">
            ×{stamp.count}
          </span>
        )}
      </div>
    );
  }

  const ink = stamp.tripId ? (tintFor(stamp.tripId).split(" ").find((c) => c.startsWith("text-")) ?? "text-fg") : "text-fg";
  const round = hashOf(stamp.key) % 2 === 0;
  const fade = stamp.state === "upcoming" ? "opacity-40" : stamp.state === "active" ? "opacity-70" : "";
  return (
    <div
      className={`w-[76px] h-[76px] shrink-0 border-2 border-dashed border-current flex flex-col items-center justify-center text-center px-1.5 ${ink} ${fade} ${
        round ? "rounded-full" : "rounded-[18px]"
      }`}
      style={{ transform: `rotate(${tilt}deg)` }}
      title={label}
    >
      <span className="text-[11px] font-bold leading-[1.15] line-clamp-2 break-words">{stamp.place}</span>
      {stamp.state === "ready" ? (
        <span className="text-[10px] font-bold mt-0.5 uppercase tracking-[0.4px]">Collect</span>
      ) : (
        <span className="text-[11px] font-medium mt-0.5 opacity-80">{shortMonth(stamp.month)}</span>
      )}
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
