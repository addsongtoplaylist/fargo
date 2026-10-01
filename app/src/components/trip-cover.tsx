import { Map as MapIcon } from "lucide-react";
import { countryCode } from "@/lib/country-code";

/** 8 soft colour pairs (DESIGN.md → No photo). Listed in full so Tailwind generates them. */
const TINTS = [
  "bg-[#dcebfa] text-[#0b5c94]",
  "bg-[#ddf3ea] text-[#1a6a4b]",
  "bg-[#fde8d8] text-[#8f4414]",
  "bg-[#ece6fb] text-[#553aa8]",
  "bg-[#fbe4ec] text-[#8e2d51]",
  "bg-[#f6eedc] text-[#7a5a12]",
  "bg-[#ddf1f3] text-[#1b6159]",
  "bg-[#e6eaf1] text-[#3b4556]",
];

/** Stable per trip: the same trip always gets the same colour ("bg-… text-…"). */
export function tintFor(tripId: string) {
  let h = 0;
  for (let i = 0; i < tripId.length; i++) h = (h * 31 + tripId.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

/**
 * Trip cover thumbnail. Until photo upload ships (P10) every trip uses the
 * no-photo cover: its colour + the 2-letter country code (map icon if unknown).
 */
export function TripCover({
  tripId,
  destination,
  size,
  radius = 14,
}: {
  tripId: string;
  destination: string;
  size: number;
  radius?: number;
}) {
  const code = countryCode(destination);
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center shrink-0 font-bold tracking-[1px] ${tintFor(tripId)}`}
      style={{ width: size, height: size, borderRadius: radius, fontSize: Math.round(size * 0.3) }}
    >
      {code ?? <MapIcon size={Math.round(size * 0.34)} strokeWidth={2} />}
    </span>
  );
}
