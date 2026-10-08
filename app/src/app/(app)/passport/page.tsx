import Link from "next/link";
import { Clock, Plane, Plus, Stamp, type LucideIcon } from "lucide-react";
import { Column } from "@/components/column";
import { Empty } from "@/components/ui/empty";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { PassportStamp, NextStamp, PASSPORT_PAGE } from "@/components/passport-stamp";
import { getPassport } from "@/lib/actions/passport";
import type { PassportStats } from "@/lib/passport";

/** Stamps shown before "See all": 3 per row, 2 rows */
const RECENT_STAMPS = 6;

/** "+1h", "−7h", "+5h 30m" */
function formatHours(hours: number) {
  const sign = hours > 0 ? "+" : "−";
  const abs = Math.abs(hours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}h${m ? ` ${m}m` : ""}`;
}

function days(n: number) {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

function daysInYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

/** Passport (v0.5.6): your trips as stamps, then your travel numbers. */
export default async function PassportPage() {
  const passport = await getPassport();
  const s = passport?.stats;

  return (
    <Column className="pt-12 pb-32">
      <h1 className="text-[30px] font-bold text-fg tracking-[-0.5px] mb-6">Passport</h1>

      {!s || s.trips === 0 ? (
        <div className="space-y-3">
          <div className="bg-surface rounded-card">
            <Empty
              size="page"
              icon={Stamp}
              title="Your passport is empty"
              message={
                s?.next
                  ? `Your first stamp arrives when ${s.next.name} begins.`
                  : "Every trip adds a stamp — plus your days away, countries and travel buddies."
              }
              action={
                !s?.next && (
                  <Link href="/trips/new" className={buttonClasses("primary", "md")}>
                    <Plus size={16} strokeWidth={2.2} aria-hidden />
                    New trip
                  </Link>
                )
              }
            />
          </div>
          {s?.next && <TripStrip stats={s} />}
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Stamps — newest first */}
          <section className={`${PASSPORT_PAGE} p-3.5`}>
            <div className="flex items-baseline justify-between mx-0.5 mb-3">
              <h2 className="text-[15px] font-semibold text-[#5b4a2e]">
                Stamps <span className="font-normal text-[#8a7655]">· {s.stamps.length}</span>
              </h2>
              <Link href="/passport/stamps" className="text-[13px] font-semibold text-brand">
                See all
              </Link>
            </div>
            {/* 3 per row, 2 rows max — the rest are on See all. "+ next" fills a spare spot. */}
            <div className="grid grid-cols-[repeat(3,76px)] justify-center gap-x-4 gap-y-3 py-2">
              {s.stamps.slice(0, RECENT_STAMPS).map((stamp) => (
                <PassportStamp key={stamp.tripId} stamp={stamp} />
              ))}
              {s.stamps.length < RECENT_STAMPS && <NextStamp />}
            </div>
          </section>

          {/* Numbers */}
          <section className="bg-surface rounded-card p-4">
            <p className="leading-none">
              <span className="text-[40px] font-bold text-brand tabular-nums">{s.daysAway.toLocaleString("en")}</span>
              <span className="text-base font-semibold text-fg ml-2">{s.daysAway === 1 ? "day away" : "days away"}</span>
            </p>
            <div className="mt-3.5 h-2 rounded-full bg-brand-soft overflow-hidden" aria-hidden>
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(100, (s.daysThisYear / daysInYear(s.year)) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-fg-muted mt-1.5">
              {s.daysThisYear} of {daysInYear(s.year)} days in {s.year} spent travelling
            </p>

            <div className="flex mt-4 pt-3.5 border-t border-line">
              <Small value={s.countries.length} label={s.countries.length === 1 ? "country" : "countries"} />
              <Small value={s.trips} label={s.trips === 1 ? "trip" : "trips"} divider />
              <Small value={s.buddies} label={s.buddies === 1 ? "buddy" : "buddies"} divider />
            </div>
          </section>

          {/* Highlights — rows only show when there's data */}
          {(s.topBuddy || s.furthest || s.timeDiff) && (
            <section className="bg-surface rounded-card divide-y divide-line">
              {s.topBuddy && (
                <Row
                  icon={<Avatar name={s.topBuddy.name} size={34} />}
                  title={`Most trips with ${s.topBuddy.name}`}
                  sub={`${s.topBuddy.trips} ${s.topBuddy.trips === 1 ? "trip" : "trips"} together`}
                />
              )}
              {s.furthest && (
                <Row
                  icon={<IconTile icon={Plane} />}
                  title="Furthest from home"
                  sub={s.furthest.place}
                  value={`${s.furthest.km.toLocaleString("en")} km`}
                />
              )}
              {s.timeDiff && (
                <Row
                  icon={<IconTile icon={Clock} />}
                  title="Biggest time difference"
                  sub={s.timeDiff.place}
                  value={formatHours(s.timeDiff.hours)}
                />
              )}
            </section>
          )}

          <TripStrip stats={s} />
        </div>
      )}
    </Column>
  );
}

function Small({ value, label, divider = false }: { value: number; label: string; divider?: boolean }) {
  return (
    <div className={`flex-1 min-w-0 ${divider ? "border-l border-line pl-3.5" : ""}`}>
      <p className="text-xl font-bold text-fg leading-tight tabular-nums">{value.toLocaleString("en")}</p>
      <p className="text-xs text-fg-muted">{label}</p>
    </div>
  );
}

/** Icon in a soft square — same look as Profile rows. */
function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="w-[34px] h-[34px] rounded-[10px] bg-page text-fg flex items-center justify-center" aria-hidden>
      <Icon size={18} strokeWidth={1.8} />
    </span>
  );
}

function Row({ icon, title, sub, value }: { icon: React.ReactNode; title: string; sub: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 min-h-[60px] py-2.5">
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-fg">{title}</p>
        <p className="text-xs text-fg-muted truncate">{sub}</p>
      </div>
      {value && <span className="text-[15px] font-semibold text-fg tabular-nums shrink-0">{value}</span>}
    </div>
  );
}

/** Now / next / last trip — shows whichever halves exist. */
function TripStrip({ stats }: { stats: PassportStats }) {
  const parts: { label: string; text: string }[] = [];
  if (stats.current) parts.push({ label: "On a trip now", text: `${stats.current.name}, day ${stats.current.day}` });
  if (stats.next) {
    parts.push({
      label: "Next trip",
      text: stats.next.inDays === 1 ? `${stats.next.name} tomorrow` : `${stats.next.name} in ${days(stats.next.inDays)}`,
    });
  }
  if (!stats.current && stats.last) {
    parts.push({
      label: "Last trip",
      text: stats.last.daysAgo === 1 ? `${stats.last.name}, ended yesterday` : `${stats.last.name}, ${days(stats.last.daysAgo)} ago`,
    });
  }
  if (parts.length === 0) return null;

  return (
    <section className="bg-brand-soft rounded-card p-4 flex gap-3">
      {parts.slice(0, 2).map((p, i) => (
        <div key={p.label} className={`flex-1 min-w-0 ${i > 0 ? "border-l border-brand/20 pl-3" : ""}`}>
          <p className="text-xs text-brand">{p.label}</p>
          <p className="text-[15px] font-semibold text-brand mt-0.5">{p.text}</p>
        </div>
      ))}
    </section>
  );
}
