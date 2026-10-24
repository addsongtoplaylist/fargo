"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { PassportStamp } from "@/components/passport-stamp";
import type { PassportStats } from "@/lib/passport";

/** Stamps per page: 2 across, 3 down */
const PER_PAGE = 6;

/** Book size — the cover and every page are the same (owner, v0.7.3) */
const BOOK = "w-[290px] h-[410px] shrink-0";
const PAPER: React.CSSProperties = {
  backgroundColor: "#f6efe2",
  backgroundImage: "repeating-radial-gradient(circle at 80% 30%, rgba(160,130,80,0.07) 0 1px, transparent 1px 9px)",
  boxShadow: "0 18px 40px rgba(60,45,20,0.22), inset 8px 0 0 #e9dfcc",
};
const GOLD = "#d4b26a";

/**
 * Passport → See all as a real passport book (v0.7.3, owner-approved sketch):
 * a navy cover (FARGO · emblem · PASSPORT) that opens to an ID page — the Fargo
 * frog and your stats — then stamp pages, 6 a page. One page at a time, turned
 * with Previous / Next (owner: buttons, no swiping).
 */
export function PassportBook({ stats }: { stats: PassportStats }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const stampPages: PassportStats["stamps"][] = [];
  for (let i = 0; i < stats.stamps.length; i += PER_PAGE) stampPages.push(stats.stamps.slice(i, i + PER_PAGE));
  if (stampPages.length === 0) stampPages.push([]);
  const total = 1 + stampPages.length;

  if (!open) {
    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open passport"
          className={`${BOOK} rounded-[10px_18px_18px_10px] bg-[#1d2b4f] flex flex-col items-center justify-between py-12 shadow-[0_18px_40px_rgba(20,26,50,0.35),inset_10px_0_0_#172341] active:scale-[0.99] transition-transform`}
        >
          <span className="font-serif text-base tracking-[5px]" style={{ color: GOLD }}>
            FARGO
          </span>
          <Emblem />
          <span className="font-serif text-[30px] tracking-[6px]" style={{ color: GOLD }}>
            PASSPORT
          </span>
        </button>
        <p className="mt-7 text-[15px] font-semibold text-fg">Tap to open</p>
        <p className="mt-1 text-[13px] text-fg-muted">
          {count(stats.collected, "stamp")} · {count(stats.countries.length, "country", "countries")} · {count(stats.trips, "trip")}
        </p>
      </div>
    );
  }

  const stamps = page > 0 ? stampPages[page - 1] : null;
  const turn = "w-11 h-11 rounded-full bg-surface border border-line flex items-center justify-center text-fg disabled:opacity-35 disabled:pointer-events-none";

  return (
    <div className="flex flex-col items-center">
      {page === 0 ? (
        <section aria-label={`Page 1 of ${total}`} className={`${BOOK} rounded-[10px_18px_18px_10px] px-[18px] pl-[26px] pt-[22px] pb-[18px] flex flex-col font-serif text-[#3b3326]`} style={PAPER}>
          <div className="flex items-center gap-3.5">
            <Image src="/mascot.png" alt="Fargo frog" width={96} height={96} className="rounded-[18px]" />
            <Field label={`DAYS AWAY IN ${stats.year}`} value={String(stats.daysThisYear)} big />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-5">
            <Field label="TRIPS" value={String(stats.trips)} />
            <Field label="COUNTRIES" value={String(stats.countries.length)} />
            <Field label="STAMPS" value={String(stats.collected)} />
            <Field label="BUDDIES" value={String(stats.buddies)} />
            {stats.topBuddy && (
              <div className="col-span-2">
                <Field label="MOST TRIPS WITH" value={`${stats.topBuddy.name} · ${count(stats.topBuddy.trips, "trip")}`} />
              </div>
            )}
          </div>
          <PageNumber n={1} />
        </section>
      ) : (
        <section
          aria-label={`Page ${page + 1} of ${total}`}
          className={`${BOOK} rounded-[10px_18px_18px_10px] pl-[22px] pr-[14px] pt-[18px] pb-[14px] flex flex-col`}
          style={PAPER}
        >
          {stamps && stamps.length > 0 ? (
            <div className="flex-1 grid grid-cols-2 content-center justify-items-center gap-x-2 gap-y-5">
              {stamps.map((stamp) => (
                <div key={stamp.key} className="scale-[1.2]">
                  <PassportStamp stamp={stamp} />
                </div>
              ))}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-center font-serif text-sm text-[#8a7655] px-6">
              Your first stamp lands here when your first trip ends.
            </p>
          )}
          <PageNumber n={page + 1} />
        </section>
      )}

      {/* Previous · dots · Next */}
      <div className="flex items-center gap-4 mt-6">
        <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Previous page" className={turn}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === page ? "w-[18px] bg-fg" : "w-1.5 bg-fg-faint"}`} />
          ))}
        </div>
        <button type="button" onClick={() => setPage(page + 1)} disabled={page === total - 1} aria-label="Next page" className={turn}>
          <ChevronRight size={20} strokeWidth={2} aria-hidden />
        </button>
      </div>
      <p className="mt-2.5 text-[13px] text-fg-muted" aria-live="polite">
        Page {page + 1} of {total}
      </p>
    </div>
  );
}

function count(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

function Field({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] tracking-[1px] text-[#8a7655]">{label}</span>
      <span className={`font-bold truncate ${big ? "text-[34px] leading-none mt-1" : "text-lg"}`}>{value}</span>
    </div>
  );
}

function PageNumber({ n }: { n: number }) {
  return <span className="mt-auto self-center font-serif text-[11px] tracking-[1px] text-[#a8987a]">— {n} —</span>;
}

/** Gold globe with a little plane — the cover's emblem */
function Emblem() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke={GOLD} strokeWidth="2" aria-hidden>
      <circle cx="60" cy="60" r="44" />
      <ellipse cx="60" cy="60" rx="20" ry="44" />
      <path d="M16 60h88M22 38h76M22 82h76" />
      <circle cx="60" cy="60" r="54" strokeDasharray="3 5" />
      <path d="M78 30l14-6-6 14-5 1-3 7-3-3 2-6z" fill={GOLD} stroke="none" />
    </svg>
  );
}
