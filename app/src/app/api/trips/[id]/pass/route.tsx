import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { countryCode as codeFromName } from "@/lib/country-code";
import { countryName } from "@/lib/passport";
import { homeEnd, destinationEnd } from "@/lib/airports";

/**
 * Trip pass image (v0.5.7): a plain boarding-pass card — FROM / TO codes,
 * places, start date and days — as a PNG with transparent rounded corners,
 * so it can be pasted onto an Instagram story as a sticker. Only for people
 * on the trip (getTrip reads under the normal trip rules).
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const INK = "#2b2b2b";
const WIDTH = 1080;
const HEIGHT = 1350;

const asset = (...parts: string[]) => readFile(join(process.cwd(), ...parts));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, account] = await Promise.all([getTrip(id), getOrCreateAccount()]);
  if (!trip || !account) return new Response("Not found", { status: 404 });

  const [sora, mono, monoSemi, logo] = await Promise.all([
    asset("src/assets/fonts/Sora-Bold.woff"),
    asset("src/assets/fonts/IBMPlexMono-Regular.woff"),
    asset("src/assets/fonts/IBMPlexMono-SemiBold.woff"),
    asset("public/logo.png"),
  ]);

  const destCode: string | null = trip.destination_country_code || codeFromName(trip.destination);
  const from = homeEnd(account.home_country_code, account.home_country_code ? countryName(account.home_country_code) : "Home");
  const to = destinationEnd(trip.base_city, destCode, destCode ? countryName(destCode) : trip.destination);

  const start = trip.start_date as string;
  const date = `${Number(start.slice(8, 10))}${MONTHS[Number(start.slice(5, 7)) - 1]}${start.slice(2, 4)}`;
  const days = differenceInCalendarDays(parseISO(trip.end_date), parseISO(start)) + 1;

  const label = { fontFamily: "Plex", fontSize: 40, letterSpacing: 4, color: INK };
  const strong = { ...label, fontWeight: 600 };
  const code = { fontFamily: "Sora", fontSize: 172, lineHeight: 1, letterSpacing: -5, color: INK };
  const col = { display: "flex", flexDirection: "column" as const, width: 380 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: 48,
          padding: "110px 96px 96px",
        }}
      >
        {/* FROM → TO */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...col }}>
            <span style={label}>FROM</span>
            <span style={{ ...code, marginTop: 24 }}>{from.code}</span>
            <span style={{ ...strong, marginTop: 28, lineHeight: 1.25 }}>{from.label.toUpperCase()}</span>
          </div>
          {/* Plane, pointing right */}
          <div style={{ display: "flex", marginTop: 132 }}>
            <svg width="76" height="76" viewBox="0 0 24 24" style={{ transform: "rotate(90deg)" }}>
              <path
                fill={INK}
                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
              />
            </svg>
          </div>
          <div style={{ ...col }}>
            <span style={label}>TO</span>
            <span style={{ ...code, marginTop: 24 }}>{to.code}</span>
            <span style={{ ...strong, marginTop: 28, lineHeight: 1.25 }}>{to.label.toUpperCase()}</span>
          </div>
        </div>

        {/* DATE · DAYS */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 130 }}>
          <div style={{ ...col }}>
            <span style={strong}>DATE</span>
            <span style={{ ...label, fontSize: 64, letterSpacing: 2, marginTop: 20 }}>{date}</span>
          </div>
          <div style={{ ...col }}>
            <span style={strong}>DAYS</span>
            <span style={{ ...label, fontSize: 64, letterSpacing: 2, marginTop: 20 }}>{days}</span>
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
