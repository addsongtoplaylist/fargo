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

/**
 * Share trip overlays (v0.5.7; the passport stamp card was removed in v0.5.16), PNG:
 * - `?style=pass` — boarding-pass layout in white text on a transparent
 *   background: FROM / TO codes and places, then distance · weather · trip days ("4D 3N") as ruled rows.
 * - `?style=photo` — vertical ticket with a see-through photo window.
 * Only for people on the trip (getTrip reads under the normal trip rules).
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WHITE = "#ffffff";

// Files are listed in next.config (outputFileTracingIncludes), so skip whole-project tracing here
const asset = (...parts: string[]) => readFile(join(/* turbopackIgnore: true */ process.cwd(), ...parts));
const dataUri = (buf: Buffer) => `data:image/png;base64,${buf.toString("base64")}`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const styleParam = new URL(req.url).searchParams.get("style");
  const style = styleParam === "photo" ? styleParam : "pass";

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

  const [temp, sora, soraRegular, mono, monoSemi] = await Promise.all([
    // A trip that has started: its days so far. Not started: the forecast for its dates.
    place
      ? getMeanTemperature(place[0], place[1], start, start <= today && end > today ? today : end, today)
      : Promise.resolve(null),
    asset("src/assets/fonts/Sora-Bold.woff"),
    asset("src/assets/fonts/Sora-Regular.woff"),
    asset("src/assets/fonts/IBMPlexMono-Regular.woff"),
    asset("src/assets/fonts/IBMPlexMono-SemiBold.woff"),
  ]);
  const kmText = km != null ? `${km.toLocaleString("en")} KM` : null;
  const tempText = temp != null ? `${temp}°C` : null;

  const fonts = [
    { name: "Sora", data: sora, weight: 700 as const, style: "normal" as const },
    { name: "Sora", data: soraRegular, weight: 400 as const, style: "normal" as const },
    { name: "Plex", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Plex", data: monoSemi, weight: 600 as const, style: "normal" as const },
  ];
  const headers = { "Cache-Control": "private, max-age=60" };

  if (style === "photo") {
    const logo = await asset("public/logo.png");
    return new ImageResponse(
      <PhotoTicket from={from} to={to} month={month} km={kmText} logo={dataUri(logo)} />,
      { width: 760, height: 1224, fonts, headers }
    );
  }

  const logo = await asset("src/assets/logo-white.png");
  return new ImageResponse(
    <TripPass from={from} to={to} km={km != null ? `${km.toLocaleString("en")}km` : "—"} temp={tempText ?? "—"} days={days} logo={dataUri(logo)} />,
    { width: 1080, height: 860, fonts, headers }
  );
}

// ── Trip pass ─────────────────────────────────────────────────

/** Trip pass (v0.5.18 layout): FROM / TO codes, then distance · weather · trip days as ruled rows. */
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
  const code = { fontFamily: "Sora", fontWeight: 700, fontSize: 172, lineHeight: 1, letterSpacing: -5, color: ink };
  const col = { display: "flex", flexDirection: "column" as const, width: 400 };
  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
    borderTop: `3px solid ${ink}`,
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 38,
    letterSpacing: -1,
    color: ink,
  };
  const nights = days > 1 ? ` ${days - 1}N` : "";
  // Place names stay on one line: long ones ("HO CHI MINH CITY") shrink to fit the 400px column
  const placeStyle = (text: string) => ({
    ...strong,
    fontSize: Math.min(40, Math.floor(400 / (text.length * 0.66))),
    letterSpacing: 3,
    marginTop: 28,
    lineHeight: 1.25,
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "72px 56px 56px 98px" }}>
      {/* FROM → TO */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={col}>
          <span style={label}>FROM</span>
          <span style={{ ...code, marginTop: 20 }}>{from.code}</span>
          <span style={placeStyle(from.label)}>{from.label.toUpperCase()}</span>
        </div>
        {/* Plane, pointing right */}
        <div style={{ display: "flex", width: 96, marginTop: 124 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" style={{ transform: "rotate(90deg)" }}>
            <path
              fill={ink}
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            />
          </svg>
        </div>
        <div style={col}>
          <span style={label}>TO</span>
          <span style={{ ...code, marginTop: 20 }}>{to.code}</span>
          <span style={placeStyle(to.label)}>{to.label.toUpperCase()}</span>
        </div>
      </div>

      {/* DISTANCE · WEATHER · TRIP DAYS */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
        <div style={row}>
          <span>DISTANCE</span>
          <span>{km}</span>
        </div>
        <div style={row}>
          <span>WEATHER</span>
          <span>{temp}</span>
        </div>
        <div style={row}>
          <span>TRIP DAYS</span>
          <span>{`${days}D${nights}`}</span>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", marginTop: "auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
        <img src={logo} width={190} height={71} alt="" />
      </div>
    </div>
  );
}

// ── Photo ticket ──────────────────────────────────────────────

/**
 * Vertical ticket with a see-through window: on a story, the user's own photo
 * or video shows through it. White frame; everything else transparent.
 * Window on top; below the tear line the route, then month · distance.
 */
function PhotoTicket({
  from,
  to,
  month,
  km,
  logo,
}: {
  from: { code: string; label: string };
  to: { code: string; label: string };
  month: string;
  km: string | null;
  logo: string;
}) {
  const W = 760;
  const H = 1224;
  const pad = 44;
  const win = { x: pad, y: 110, w: W - pad * 2, h: 832 };
  const tear = 980;
  const arrowY = 1068;
  const dark = "#1b1b1b";
  const muted = "#7a7a7a";
  const placeSize = Math.min(36, Math.floor((W - pad * 2 - 40) / ((from.label.length + to.label.length) * 0.64)));
  const row = { position: "absolute" as const, left: pad, right: pad, display: "flex", justifyContent: "space-between", alignItems: "center" };

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
        <line x1={pad} y1={arrowY} x2={W - pad - 14} y2={arrowY} stroke={dark} strokeWidth={3} />
        <path d={`M${W - pad} ${arrowY} L${W - pad - 18} ${arrowY - 9} L${W - pad - 18} ${arrowY + 9} Z`} fill={dark} />
      </svg>

      {/* Header: wordmark · TRIP PASS */}
      <div style={{ ...row, top: 30 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
        <img src={logo} width={136} height={51} alt="" />
        <span style={{ fontFamily: "Plex", fontSize: 30, fontWeight: 600, color: dark, letterSpacing: 2 }}>TRIP PASS</span>
      </div>

      {/* From → to */}
      <div style={{ ...row, top: arrowY - 62 }}>
        <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: placeSize, color: dark }}>{from.label.toUpperCase()}</span>
        <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: placeSize, color: dark }}>{to.label.toUpperCase()}</span>
      </div>
      <div style={{ ...row, top: arrowY + 12 }}>
        <span style={{ fontFamily: "Plex", fontSize: 28, color: muted }}>{from.code}</span>
        <span style={{ fontFamily: "Plex", fontSize: 28, color: muted }}>{to.code}</span>
      </div>

      {/* Month · distance */}
      <div style={{ ...row, top: 1132 }}>
        <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 32, color: dark }}>{month}</span>
        {km && <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 32, color: dark }}>{km}</span>}
      </div>
    </div>
  );
}
