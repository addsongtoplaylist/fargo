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
 * Trip pass overlay (v0.5.7): boarding-pass layout — FROM / TO codes and
 * places, then distance · temperature · days of trip, and the wordmark.
 * `?style=light` (white text) / `dark` (dark text) are transparent PNGs to
 * place as an Instagram story sticker; `card` is the same on a white card.
 * Only for people on the trip (getTrip reads under the normal trip rules).
 */

const STYLES = {
  light: { ink: "#ffffff", background: "transparent" },
  dark: { ink: "#2b2b2b", background: "transparent" },
  card: { ink: "#2b2b2b", background: "#ffffff" },
} as const;
type Style = keyof typeof STYLES;

const WIDTH = 1080;
const HEIGHT = 1080;

const asset = (...parts: string[]) => readFile(join(process.cwd(), ...parts));

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const styleParam = new URL(req.url).searchParams.get("style");
  const style: Style = styleParam === "dark" || styleParam === "card" ? styleParam : "light";
  const { ink, background } = STYLES[style];

  const [trip, account] = await Promise.all([getTrip(id), getOrCreateAccount()]);
  if (!trip || !account) return new Response("Not found", { status: 404 });

  const destCode: string | null = trip.destination_country_code || codeFromName(trip.destination);
  const from = homeEnd(account.home_country_code, account.home_country_code ? countryName(account.home_country_code) : "Home");
  const to = destinationEnd(trip.base_city, destCode, destCode ? countryName(destCode) : trip.destination);

  // Where the trip is: base city, else destination, else the country's centre
  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
  const lat = num(trip.base_lat) ?? num(trip.destination_lat);
  const lng = num(trip.base_lng) ?? num(trip.destination_lng);
  const centre = countryCentre(destCode);
  const place = lat != null && lng != null ? [lat, lng] : centre;

  const km = kmFromHome(account.home_country_code, lat, lng, destCode);
  const today = todayForCountry(account.home_country_code);
  const [temp, sora, mono, monoSemi, logo] = await Promise.all([
    // A trip that has started: its days so far. Not started: the forecast for its dates.
    place
      ? getMeanTemperature(
          place[0],
          place[1],
          trip.start_date,
          trip.start_date <= today && trip.end_date > today ? today : trip.end_date,
          today
        )
      : Promise.resolve(null),
    asset("src/assets/fonts/Sora-Bold.woff"),
    asset("src/assets/fonts/IBMPlexMono-Regular.woff"),
    asset("src/assets/fonts/IBMPlexMono-SemiBold.woff"),
    asset("public/logo.png"),
  ]);
  const days = differenceInCalendarDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  const label = { fontFamily: "Plex", fontSize: 40, letterSpacing: 4, color: ink };
  const strong = { ...label, fontWeight: 600 };
  const code = { fontFamily: "Sora", fontSize: 172, lineHeight: 1, letterSpacing: -5, color: ink };
  const col = { display: "flex", flexDirection: "column" as const, width: 380 };
  const stat = { display: "flex", flexDirection: "column" as const, width: 296 };
  const statLabel = { ...strong, fontSize: 32, letterSpacing: 2 };
  const statValue = { ...label, fontSize: 56, letterSpacing: 1, marginTop: 16 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background,
          borderRadius: 48,
          padding: "96px 96px 88px",
        }}
      >
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

        {/* DISTANCE · TEMPERATURE · DAYS OF TRIP */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 120 }}>
          <div style={stat}>
            <span style={statLabel}>DISTANCE</span>
            <span style={statValue}>{km != null ? `${km.toLocaleString("en")} km` : "—"}</span>
          </div>
          <div style={stat}>
            <span style={statLabel}>TEMPERATURE</span>
            <span style={statValue}>{temp != null ? `${temp}°C` : "—"}</span>
          </div>
          <div style={stat}>
            <span style={statLabel}>DAYS OF TRIP</span>
            <span style={statValue}>{days}</span>
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", marginTop: "auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, not the page */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={204} height={76} alt="" />
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Sora", data: sora, weight: 700, style: "normal" },
        { name: "Plex", data: mono, weight: 400, style: "normal" },
        { name: "Plex", data: monoSemi, weight: 600, style: "normal" },
      ],
      headers: { "Cache-Control": "private, max-age=60" },
    }
  );
}
