"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import { HeroNav } from "./site-nav";

/**
 * Hero (LANDING.md → Redesign v6): the owner's montage of six trips, full screen, with a Fargo
 * share overlay per scene drawn in code (sharp at any size, never baked into the video):
 * - Trip pass (Japan, Malaysia, Korea): bottom centre, over a dark gradient from the bottom;
 * - Photo ticket (Vietnam, Singapore, Thailand): large, its see-through window over the scene's
 *   subject (wide screens move the ticket; phones shift the video so the subject is centred).
 * One landscape video; phones show its centre, where every scene keeps its subject.
 * The page's h1 stays for screen readers and search, hidden on screen (owner, 2026-10-12).
 */
// Branding/Home banner footage.mov → H.264 1080p, no sound, ~5.5 MB (ffmpeg: -crf 29 -maxrate 2.6M, faststart)
const VIDEO = "/marketing/hero.mp4";
const POSTER = "/marketing/hero-poster.webp";

/** Seconds; the owner's cut list at 30 fps (e.g. 0:03:05 = 3 s + 5 frames). Trip details are made up. */
const f = (s: number, frames: number) => s + frames / 30;
type Scene = {
  kind: "pass" | "ticket";
  from: [number, number];
  to: [number, number];
  a: [string, string];
  b: [string, string];
  km: string;
  temp: string;
  days: string;
  dates: string;
  month: string;
  /** Tickets: where the subject sits across the video (%), so the ticket's window frames it */
  focus?: number;
};
const SCENES = (
  [
    { kind: "pass", from: [0, 0], to: [3, 5], a: ["SIN", "SINGAPORE"], b: ["HND", "TOKYO"], km: "5,320km", temp: "14°C", days: "6D 5N", dates: "02.04 – 07.04", month: "APR 2026" },
    // Vietnam: the girl and the friend in the yellow shirt
    { kind: "ticket", from: [3, 6], to: [6, 11], a: ["KUL", "KUALA LUMPUR"], b: ["SGN", "HO CHI MINH CITY"], km: "1,060km", temp: "31°C", days: "4D 3N", dates: "12.03 – 15.03", month: "MAR 2026", focus: 43 },
    // Singapore: the lady at the table
    { kind: "ticket", from: [6, 12], to: [9, 4], a: ["HND", "TOKYO"], b: ["SIN", "SINGAPORE"], km: "5,320km", temp: "30°C", days: "4D 3N", dates: "18.07 – 21.07", month: "JUL 2026", focus: 64 },
    { kind: "pass", from: [9, 5], to: [12, 10], a: ["CGK", "JAKARTA"], b: ["KUL", "TAMAN NEGARA"], km: "1,150km", temp: "27°C", days: "3D 2N", dates: "09.08 – 11.08", month: "AUG 2026" },
    { kind: "pass", from: [12, 11], to: [14, 28], a: ["BKK", "BANGKOK"], b: ["ICN", "SEOUL"], km: "3,720km", temp: "18°C", days: "5D 4N", dates: "20.10 – 24.10", month: "OCT 2026" },
    // Thailand: the river and the food boat
    { kind: "ticket", from: [14, 29], to: [17, 28], a: ["KUL", "KUALA LUMPUR"], b: ["BKK", "BANGKOK"], km: "1,180km", temp: "33°C", days: "3D 2N", dates: "05.12 – 07.12", month: "DEC 2026", focus: 40 },
  ] as Scene[]
).map((s) => ({ ...s, start: f(...s.from), end: f(s.to[0], s.to[1] + 1) }));
type Timed = (typeof SCENES)[number];

/**
 * scene: which overlay shows (fades in just after a cut, out just before the next).
 * shot: which scene is on screen right now, for framing the video on phones.
 */
function useScene(video: React.RefObject<HTMLVideoElement | null>) {
  const [scene, setScene] = useState<number | null>(0);
  const [shot, setShot] = useState(0);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const v = video.current;
      if (v && !v.paused) {
        const t = v.currentTime;
        const i = SCENES.findIndex((s) => t >= s.start + 0.2 && t < s.end - 0.35);
        setScene(i === -1 ? null : i);
        setShot(Math.max(0, SCENES.findIndex((s) => t >= s.start && t < s.end)));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [video]);
  return { scene, shot };
}

const MONO = "font-[family-name:var(--font-plex)] tracking-[0.1em]";

/** The Trip pass (v0.5.18 share overlay) in HTML, white with a soft shadow; sized in container units. */
function TripPass({ s }: { s: Timed }) {
  const row = "flex items-center justify-between border-t-[0.28cqw] border-white h-[7.4cqw] text-[3.5cqw] tracking-[-0.03em]";
  return (
    <div className="@container w-full [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.25))]">
      <div className="flex flex-col px-[8cqw] pt-[5cqw] pb-[4cqw] text-white">
        <div className="flex items-start">
          {[s.a, s.b].map(([code, place], i) => (
            <div key={code + i} className="flex items-start">
              {i === 1 && (
                <span className="w-[12cqw] mt-[9cqw] flex justify-center">
                  <Plane className="w-[7cqw] h-[7cqw] rotate-45" fill="white" strokeWidth={0} aria-hidden />
                </span>
              )}
              <div className="flex flex-col w-[35cqw]">
                <span className={`${MONO} text-[3.7cqw]`}>{i ? "TO" : "FROM"}</span>
                <span className="mt-[1.8cqw] text-[15.9cqw] leading-none font-bold tracking-[-0.03em]">{code}</span>
                <span className={`${MONO} mt-[2.6cqw] font-medium whitespace-nowrap`} style={{ fontSize: `${Math.min(3.7, 35 / (place.length * 0.66))}cqw` }}>
                  {place}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col mt-[3.7cqw]">
          <div className={row}>
            <span>DISTANCE</span>
            <span>{s.km}</span>
          </div>
          <div className={row}>
            <span>WEATHER</span>
            <span>{s.temp}</span>
          </div>
          <div className={row}>
            <span>TRIP DAYS</span>
            <span>{s.days}</span>
          </div>
        </div>
        <Image src="/marketing/wordmark-white.svg" alt="" width={584} height={208} unoptimized className="mt-[4.5cqw] w-[17.6cqw] h-auto" />
      </div>
    </div>
  );
}

/**
 * The Photo ticket (v0.5.18 share overlay) in HTML/SVG: white frame with a see-through window,
 * notches and a tear line; UNBOUND, Oswald place names, day-first dates. Drawn on the 760×1224
 * share-image grid (1cqw = 7.6px there), so it matches the PNG exactly at any size.
 */
function PhotoTicket({ s }: { s: Timed }) {
  const W = 760;
  const H = 1224;
  const pad = 44;
  const win = { x: pad, y: 110, w: W - pad * 2, h: 832 };
  const tear = 980;
  const arrowY = 1068;
  const dark = "#1b1b1b";
  const y = (px: number) => `${(px / H) * 100}%`;
  const cq = (px: number) => `${px / 7.6}cqw`;
  const placePx = Math.min(54, Math.floor((W - pad * 2 - 40) / ((s.a[1].length + s.b[1].length) * 0.48)));
  const row = "absolute flex justify-between items-center";
  const side = { left: cq(pad), right: cq(pad) };
  return (
    <div className="@container relative w-full aspect-[760/1224] [filter:drop-shadow(0_12px_30px_rgba(0,0,0,0.35))]">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <mask id={`ticket-${s.b[0]}`}>
            <rect width={W} height={H} rx={30} fill="#fff" />
            <circle cx={0} cy={tear} r={28} fill="#000" />
            <circle cx={W} cy={tear} r={28} fill="#000" />
            <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={20} fill="#000" />
          </mask>
        </defs>
        <rect width={W} height={H} rx={30} fill="#fff" mask={`url(#ticket-${s.b[0]})`} />
        <line x1={40} y1={tear} x2={W - 40} y2={tear} stroke="#b4b4b4" strokeWidth={3} strokeDasharray="13 13" />
        <line x1={pad} y1={arrowY} x2={W - pad - 14} y2={arrowY} stroke={dark} strokeWidth={3} />
        <path d={`M${W - pad} ${arrowY} L${W - pad - 18} ${arrowY - 9} L${W - pad - 18} ${arrowY + 9} Z`} fill={dark} />
      </svg>

      <div className={row} style={{ ...side, top: y(30), height: y(51) }}>
        <Image src="/logo.png" alt="" width={136} height={51} className="h-full w-auto" />
        <span className={`${MONO} font-medium`} style={{ fontSize: cq(30), color: dark }}>
          UNBOUND
        </span>
      </div>
      <div className={row} style={{ ...side, top: y(arrowY - 14 - placePx), color: dark }}>
        {[s.a[1], s.b[1]].map((p, i) => (
          <span key={i} className="font-[family-name:var(--font-oswald)] font-medium uppercase leading-none tracking-[0.01em]" style={{ fontSize: cq(placePx) }}>
            {p}
          </span>
        ))}
      </div>
      <div className={row} style={{ ...side, top: y(arrowY + 12) }}>
        {[s.a[0], s.b[0]].map((c, i) => (
          <span key={i} className="font-[family-name:var(--font-plex)]" style={{ fontSize: cq(28), color: "#7a7a7a" }}>
            {c}
          </span>
        ))}
      </div>
      <div className={row} style={{ ...side, top: y(1130), color: dark }}>
        <span className="font-bold" style={{ fontSize: cq(32) }}>
          {s.dates}
        </span>
        <span className="font-bold" style={{ fontSize: cq(32) }}>
          {s.month}
        </span>
      </div>
    </div>
  );
}

/** focus: on phones (which show the video's centre), shift the frame so a ticket scene's subject sits under the window. */
function HeroVideo({ video, focus }: { video: React.RefObject<HTMLVideoElement | null>; focus: number }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.pause();
  }, [video]);
  return (
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover object-[var(--focus)_50%] md:object-center"
      style={{ ["--focus" as string]: `${focus}%` }}
      src={VIDEO}
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const { scene, shot } = useScene(video);

  return (
    <section className="h-svh sm:px-2 sm:pt-2">
      <h1 className="sr-only">Fargo: every trip starts here</h1>
      <div className="relative h-full sm:rounded-[20px] overflow-hidden bg-[#1d2a36] text-white">
        <HeroVideo video={video} focus={SCENES[shot].focus ?? 50} />
        {/* Dark gradient rising from the bottom, under the Trip passes */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(to_top,rgba(0,0,0,0.7),rgba(0,0,0,0.35)_45%,transparent)]" aria-hidden />

        {SCENES.map((s, i) => (
          <div
            key={i}
            className={
              s.kind === "ticket"
                ? "absolute left-1/2 md:left-[var(--x)] top-1/2 -translate-x-1/2 -translate-y-[46%] w-[min(76vw,54svh,330px)] md:w-[min(30vw,52svh,500px)]"
                : "absolute left-1/2 -translate-x-1/2 bottom-[5%] w-[min(82vw,330px)] md:w-[clamp(320px,30vw,460px)]"
            }
            style={s.focus ? { ["--x" as string]: `${s.focus}%` } : undefined}
            aria-hidden={scene !== i}
          >
            <div
              className={`transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                scene === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {s.kind === "ticket" ? <PhotoTicket s={s} /> : <TripPass s={s} />}
              <span className="sr-only">
                Fargo {s.kind === "ticket" ? "photo ticket" : "trip pass"}: {s.a[1]} to {s.b[1]}
              </span>
            </div>
          </div>
        ))}

        <HeroNav />
      </div>
    </section>
  );
}
