import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { countryCode as codeFromName } from "@/lib/country-code";
import { countryName, countryCentre, kmFromHome } from "@/lib/passport";
import { homeEnd, destinationEnd } from "@/lib/airports";
import { getMeanTemperature } from "@/lib/weather";
import { todayForCountry } from "@/lib/dates";
import { stampArtFor } from "@/lib/stamp-art";
import { parse as parseFont, type Font } from "opentype.js";
import { curvedTextPath } from "@/lib/curved-text";

/**
 * Share trip overlays (v0.5.7), PNG:
 * - `?style=pass` — boarding-pass layout in white text on a transparent
 *   background: FROM / TO codes and places, distance · temperature · trip days.
 * - `?style=stamp` — deep-navy card with a round ink passport stamp: place,
 *   month, from, distance · temperature, "4D3N" and the wordmark.
 * Only for people on the trip (getTrip reads under the normal trip rules).
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WHITE = "#ffffff";
const CREAM = "#f6f2e8";
const NAVY = "#0b3a5e";

const asset = (...parts: string[]) => readFile(join(process.cwd(), ...parts));
const dataUri = (buf: Buffer) => `data:image/png;base64,${buf.toString("base64")}`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const styleParam = new URL(req.url).searchParams.get("style");
  const style = styleParam === "stamp" || styleParam === "photo" ? styleParam : "pass";

  const [trip, account] = await Promise.all([getTrip(id), getOrCreateAccount()]);
  if (!trip || !account) return new Response("Not found", { status: 404 });

  // ── Trip facts ────────────────────────────────────────────
  const destCode: string | null = trip.destination_country_code || codeFromName(trip.destination);
  const destCountry = destCode ? countryName(destCode) : trip.destination;
  const from = homeEnd(account.home_country_code, account.home_country_code ? countryName(account.home_country_code) : "Home");
  const to = destinationEnd(trip.base_city, destCode, destCountry);

  // Where the trip is: base city, else destination, else the country's centre
  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
  const lat = num(trip.base_lat) ?? num(trip.destination_lat);
  const lng = num(trip.base_lng) ?? num(trip.destination_lng);
  const place = lat != null && lng != null ? [lat, lng] : countryCentre(destCode);

  const km = kmFromHome(account.home_country_code, lat, lng, destCode);
  const today = todayForCountry(account.home_country_code);
  const start = trip.start_date as string;
  const end = trip.end_date as string;
  const days = differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;
  const month = `${MONTHS[Number(start.slice(5, 7)) - 1]} ${start.slice(0, 4)}`;

  const [temp, sora, mono, monoSemi] = await Promise.all([
    // A trip that has started: its days so far. Not started: the forecast for its dates.
    place
      ? getMeanTemperature(place[0], place[1], start, start <= today && end > today ? today : end, today)
      : Promise.resolve(null),
    asset("src/assets/fonts/Sora-Bold.woff"),
    asset("src/assets/fonts/IBMPlexMono-Regular.woff"),
    asset("src/assets/fonts/IBMPlexMono-SemiBold.woff"),
  ]);
  const kmText = km != null ? `${km.toLocaleString("en")} KM` : null;
  const tempText = temp != null ? `${temp}°C` : null;

  const fonts = [
    { name: "Sora", data: sora, weight: 700 as const, style: "normal" as const },
    { name: "Plex", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Plex", data: monoSemi, weight: 600 as const, style: "normal" as const },
  ];
  const headers = { "Cache-Control": "private, max-age=60" };

  if (style === "stamp") {
    const [logo, art] = await Promise.all([
      asset("src/assets/logo-white.png"),
      stampArtFor(to.label) ? asset(stampArtFor(to.label)!) : Promise.resolve(null),
    ]);
    return new ImageResponse(
      <StampCard
        city={to.label}
        country={destCountry}
        month={month}
        from={from.label}
        facts={[kmText, tempText].filter(Boolean).join(" · ")}
        days={days}
        code={destCode}
        logo={dataUri(logo)}
        art={art ? dataUri(art) : null}
        font={parseFont(sora.buffer.slice(sora.byteOffset, sora.byteOffset + sora.byteLength) as ArrayBuffer)}
      />,
      { width: 1180, height: 700, fonts, headers }
    );
  }

  if (style === "photo") {
    const logo = await asset("public/logo.png");
    return new ImageResponse(
      <PhotoTicket
        from={from}
        to={to}
        month={month}
        days={days}
        km={kmText}
        temp={tempText}
        logo={dataUri(logo)}
      />,
      { width: 760, height: 1300, fonts, headers }
    );
  }

  const logo = await asset("src/assets/logo-white.png");
  return new ImageResponse(
    <TripPass from={from} to={to} km={kmText?.toLowerCase() ?? "—"} temp={tempText ?? "—"} days={days} logo={dataUri(logo)} />,
    { width: 1080, height: 860, fonts, headers }
  );
}

// ── Trip pass ─────────────────────────────────────────────────

function TripPass({
  from,
  to,
  km,
  temp,
  days,
  logo,
}: {
  from: { code: string; label: string };
  to: { code: string; label: string };
  km: string;
  temp: string;
  days: number;
  logo: string;
}) {
  const ink = WHITE;
  const label = { fontFamily: "Plex", fontSize: 40, letterSpacing: 4, color: ink };
  const strong = { ...label, fontWeight: 600 };
  const code = { fontFamily: "Sora", fontSize: 172, lineHeight: 1, letterSpacing: -5, color: ink };
  const col = { display: "flex", flexDirection: "column" as const, width: 380 };
  const stat = { display: "flex", flexDirection: "column" as const, width: 296 };
  const statLabel = { ...strong, fontSize: 32, letterSpacing: 2 };
  const statValue = { ...label, fontSize: 56, letterSpacing: 1, marginTop: 16 };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "72px 96px 64px" }}>
      {/* FROM → TO */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={col}>
          <span style={label}>FROM</span>
          <span style={{ ...code, marginTop: 24 }}>{from.code}</span>
          <span style={{ ...strong, marginTop: 28, lineHeight: 1.25 }}>{from.label.toUpperCase()}</span>
        </div>
        {/* Plane, pointing right */}
        <div style={{ display: "flex", marginTop: 132 }}>
          <svg width="76" height="76" viewBox="0 0 24 24" style={{ transform: "rotate(90deg)" }}>
            <path
              fill={ink}
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            />
          </svg>
        </div>
        <div style={col}>
          <span style={label}>TO</span>
          <span style={{ ...code, marginTop: 24 }}>{to.code}</span>
          <span style={{ ...strong, marginTop: 28, lineHeight: 1.25 }}>{to.label.toUpperCase()}</span>
        </div>
      </div>

      {/* DISTANCE · TEMPERATURE · TRIP DAYS */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 64 }}>
        <div style={stat}>
          <span style={statLabel}>DISTANCE</span>
          <span style={statValue}>{km}</span>
        </div>
        <div style={stat}>
          <span style={statLabel}>TEMPERATURE</span>
          <span style={statValue}>{temp}</span>
        </div>
        <div style={stat}>
          <span style={statLabel}>TRIP DAYS</span>
          <span style={statValue}>{days}</span>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", marginTop: "auto", paddingTop: 48 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
        <img src={logo} width={204} height={76} alt="" />
      </div>
    </div>
  );
}

// ── Passport stamp card ───────────────────────────────────────

function StampCard({
  city,
  country,
  month,
  from,
  facts,
  days,
  code,
  logo,
  art,
  font,
}: {
  city: string;
  country: string;
  month: string;
  from: string;
  facts: string;
  days: number;
  code: string | null;
  logo: string;
  art: string | null;
  font: Font;
}) {
  const sameAsCountry = city.toLowerCase() === country.toLowerCase();
  // "HO CHI MINH" / "CITY VIETNAM": a long name drops its last word to line 2
  const words = city.toUpperCase().split(/\s+/);
  const line1 = words.length >= 3 ? words.slice(0, -1).join(" ") : words.join(" ");
  const line2 = words.length >= 3 ? words[words.length - 1] : null;
  const titleSize = Math.min(84, Math.floor(600 / (line1.length * 0.66)));
  const mono = { fontFamily: "Plex", fontSize: 40, color: CREAM, letterSpacing: 1 };

  // "4D3N": shrink for long trips so it always fits beside the wordmark
  const nights = days > 1 ? String(days - 1) : "";
  const rowAt = (k: number) =>
    textWidth(String(days), 150 * k) + textWidth("D", 76 * k) + (nights ? textWidth(nights, 150 * k) + textWidth("N", 76 * k) : 0) + 32 * k;
  const k = Math.min(1, (640 - 188 - 44) / rowAt(1));
  const big = { fontFamily: "Sora", fontSize: 150 * k, lineHeight: 1, color: CREAM, flexShrink: 0 };
  const unit = { fontFamily: "Sora", fontSize: 76 * k, lineHeight: 1, color: CREAM, marginLeft: 6 * k, marginRight: 10 * k, flexShrink: 0 };

  const W = 1180;
  const H = 700;
  const tear = 780; // the ticket's tear line; the stamp sits across it
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", padding: "48px 56px 56px" }}>
      {/* Ticket: rounded card with notches where it tears, and a dashed tear line */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <mask id="ticket">
            <rect width={W} height={H} rx={36} fill="#fff" />
            <circle cx={tear} cy={0} r={30} fill="#000" />
            <circle cx={tear} cy={H} r={30} fill="#000" />
          </mask>
        </defs>
        <rect width={W} height={H} rx={36} fill={NAVY} mask="url(#ticket)" />
        <line x1={tear} y1={46} x2={tear} y2={H - 46} stroke={CREAM} strokeOpacity={0.55} strokeWidth={3} strokeDasharray="12 14" />
      </svg>

      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", width: 640, height: "100%" }}>
        <span style={{ fontFamily: "Sora", fontSize: titleSize, lineHeight: 1.05, color: CREAM, letterSpacing: -1 }}>{line1}</span>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 4 }}>
          {line2 && <span style={{ fontFamily: "Sora", fontSize: 64, lineHeight: 1, color: CREAM, marginRight: 18 }}>{line2}</span>}
          {!sameAsCountry && <span style={{ ...mono, fontWeight: 600, marginBottom: 4 }}>{country.toUpperCase()}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <span style={{ ...mono, fontWeight: 600 }}>{month}</span>
          <span style={{ ...mono, marginTop: 12 }}>FROM {from.toUpperCase()}</span>
          {facts && <span style={{ ...mono, marginTop: 12 }}>{facts}</span>}
        </div>

        {/* 4D3N · wordmark */}
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: "auto" }}>
          <span style={big}>{days}</span>
          <span style={unit}>D</span>
          {nights && <span style={big}>{nights}</span>}
          {nights && <span style={unit}>N</span>}
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
          <img src={logo} width={188} height={70} alt="" style={{ marginLeft: 44, marginBottom: 2, flexShrink: 0 }} />
        </div>
      </div>

      {/* Stamp across the tear line, slightly tilted like it was stamped by hand */}
      <div style={{ position: "absolute", left: 572, top: 88, display: "flex" }}>
        <InkStamp font={font} size={530} top={`${city.toUpperCase()}${sameAsCountry ? "" : ` · ${country.toUpperCase()}`}`} bottom={month} art={art} code={code} />
      </div>
    </div>
  );
}

// ── Photo ticket ──────────────────────────────────────────────

/**
 * Vertical ticket with a see-through window: on a story, the user's own photo
 * or video shows through it. White frame; everything else transparent.
 */
function PhotoTicket({
  from,
  to,
  month,
  days,
  km,
  temp,
  logo,
}: {
  from: { code: string; label: string };
  to: { code: string; label: string };
  month: string;
  days: number;
  km: string | null;
  temp: string | null;
  logo: string;
}) {
  const W = 760;
  const H = 1300;
  const win = { x: 48, y: 120, w: W - 96, h: 640 };
  const routeY = win.y + win.h + 100;
  const tear = routeY + 80;
  const dark = "#1b1b1b";
  const muted = "#7a7a7a";
  const mono = { fontFamily: "Plex", fontSize: 26, fontWeight: 600, color: muted, letterSpacing: 1 };
  const value = { fontFamily: "Sora", fontSize: 46, color: dark, lineHeight: 1.1, marginTop: 6 };
  const tripLength = days > 1 ? `${days}D${days - 1}N` : `${days}D`;
  const fields: [string, string][] = [
    ["DATE", month],
    ["TRIP", tripLength],
    ["DISTANCE", km ?? "—"],
    ["TEMP", temp ?? "—"],
  ];
  const placeSize = (t: string) => (t.length > 16 ? 28 : 34);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <mask id="frame">
            <rect width={W} height={H} rx={30} fill="#fff" />
            <circle cx={0} cy={tear} r={28} fill="#000" />
            <circle cx={W} cy={tear} r={28} fill="#000" />
            <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={20} fill="#000" />
          </mask>
        </defs>
        <rect width={W} height={H} rx={30} fill="#fff" mask="url(#frame)" />
        <line x1={40} y1={tear} x2={W - 40} y2={tear} stroke="#b4b4b4" strokeWidth={3} strokeDasharray="13 13" />
        {/* Route arrow */}
        <line x1={48} y1={routeY} x2={W - 62} y2={routeY} stroke={dark} strokeWidth={3} />
        <path d={`M${W - 48} ${routeY} L${W - 66} ${routeY - 9} L${W - 66} ${routeY + 9} Z`} fill={dark} />
      </svg>

      {/* Header: wordmark · TRIP PASS */}
      <div style={{ position: "absolute", left: 48, top: 26, right: 48, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
        <img src={logo} width={150} height={56} alt="" />
        <span style={{ fontFamily: "Plex", fontSize: 30, fontWeight: 600, color: dark, letterSpacing: 2 }}>TRIP PASS</span>
      </div>

      {/* From → to */}
      <div style={{ position: "absolute", left: 48, right: 48, top: win.y + win.h + 34, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Sora", fontSize: placeSize(from.label), color: dark }}>{from.label.toUpperCase()}</span>
        <span style={{ fontFamily: "Sora", fontSize: placeSize(to.label), color: dark }}>{to.label.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: 48, right: 48, top: routeY + 12, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Plex", fontSize: 28, color: muted }}>{from.code}</span>
        <span style={{ fontFamily: "Plex", fontSize: 28, color: muted }}>{to.code}</span>
      </div>

      {/* Stub */}
      <div style={{ position: "absolute", left: 48, right: 48, top: tear + 44, display: "flex", flexWrap: "wrap" }}>
        {fields.map(([k, v]) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", width: (W - 96) / 2, marginBottom: 28 }}>
            <span style={mono}>{k}</span>
            <span style={value}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sora Bold advance widths (em), measured from the font — spaces curved text evenly. */
const SORA_WIDTH: Record<string, number> = {
  A: 0.782, B: 0.692, C: 0.8, D: 0.781, E: 0.594, F: 0.56, G: 0.833, H: 0.8, I: 0.332, J: 0.643, K: 0.752,
  L: 0.558, M: 0.971, N: 0.876, O: 0.864, P: 0.667, Q: 0.864, R: 0.73, S: 0.667, T: 0.618, U: 0.776, V: 0.74,
  W: 1.071, X: 0.722, Y: 0.657, Z: 0.647, "0": 0.763, "1": 0.428, "2": 0.632, "3": 0.632, "4": 0.672,
  "5": 0.644, "6": 0.687, "7": 0.607, "8": 0.667, "9": 0.687, " ": 0.21, "·": 0.273, ".": 0.273, ",": 0.273,
  "-": 0.509, "'": 0.268, "&": 0.731, "(": 0.393, ")": 0.393,
};
const charWidth = (c: string) => SORA_WIDTH[c] ?? 0.7;
const textWidth = (t: string, size: number) => Math.ceil([...t].reduce((a, c) => a + charWidth(c), 0) * size);

/**
 * Round ink passport stamp. With art (rings + illustration, AI-drawn per
 * place) Fargo only adds the wording in the ring; without art it draws the
 * rings itself with the country code in the middle.
 */
function InkStamp({
  font,
  size,
  top,
  bottom,
  art,
  code,
}: {
  font: Font;
  size: number;
  top: string;
  bottom: string;
  art: string | null;
  code: string | null;
}) {
  const band = (179 / 450) * size; // middle of the empty ring band
  const ring = (inset: number, width: number) => ({
    position: "absolute" as const,
    left: inset,
    top: inset,
    width: size - inset * 2,
    height: size - inset * 2,
    borderRadius: "50%",
    border: `${width}px solid ${CREAM}`,
  });
  const fontSize = top.length > 30 ? 22 : 26;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", transform: "rotate(-9deg)" }}>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page
        <img src={art} width={size} height={size} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      ) : (
        <>
          <div style={ring(size * 0.005, size * 0.022)} />
          <div style={ring(size * 0.045, 3)} />
          <div style={ring(size * 0.155, 3)} />
          <div style={ring(size * 0.175, 2)} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Sora",
              fontSize: size * 0.26,
              color: CREAM,
              letterSpacing: -4,
            }}
          >
            {code ?? "✈"}
          </div>
        </>
      )}
      {/* Ring wording, drawn from the font's outlines */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          fill={CREAM}
          d={
            curvedTextPath(font, top, { cx: size / 2, cy: size / 2, radius: band, size: (fontSize * size) / 480, top: true }) +
            curvedTextPath(font, bottom, {
              cx: size / 2,
              cy: size / 2,
              radius: band,
              size: (26 * size) / 480,
              top: false,
              letterSpacing: 0.22,
            })
          }
        />
      </svg>
    </div>
  );
}
