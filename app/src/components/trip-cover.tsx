import { Map as MapIcon } from "lucide-react";
import { countryCode } from "@/lib/country-code";
import { coverUrl, coverObjectPosition } from "@/lib/cover";

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
 * Trip cover thumbnail: the planner's photo when there is one (P10),
 * otherwise the trip's colour + 2-letter country code (map icon if unknown).
 * `wide` = full card width, 12:5 banner (My trips current/upcoming cards).
 */
export function TripCover({
  tripId,
  destination,
  coverPath,
  coverPosition,
  size = 92,
  radius = 14,
  wide = false,
}: {
  tripId: string;
  destination: string;
  coverPath?: string | null;
  /** 0–100, how far down the photo is shown (50 = middle) */
  coverPosition?: number | null;
  size?: number;
  radius?: number;
  wide?: boolean;
}) {
  const url = coverUrl(coverPath);
  const box = wide
    ? { width: "100%", aspectRatio: "12 / 5", borderRadius: radius }
    : { width: size, height: size, borderRadius: radius };
  const codeSize = wide ? 44 : size;
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Supabase storage photo; already resized on upload
      <img
        src={url}
        alt=""
        aria-hidden
        loading="lazy"
        className="shrink-0 object-cover bg-skeleton"
        style={{ ...box, objectPosition: coverObjectPosition(coverPosition) }}
      />
    );
  }
  const code = countryCode(destination);
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center shrink-0 font-bold tracking-[1px] ${tintFor(tripId)}`}
      style={{ ...box, fontSize: Math.round(codeSize * (wide ? 1 : 0.3)) }}
    >
      {code ?? <MapIcon size={Math.round(codeSize * (wide ? 0.8 : 0.34))} strokeWidth={2} />}
    </span>
  );
}
