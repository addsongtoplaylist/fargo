"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import { HeroNav } from "./site-nav";
import { RevealWords } from "./motion";

/**
 * Hero (LANDING.md → Redesign v6): the owner's montage of six trips, full screen, with a Fargo
 * Trip pass for each scene drawn in code on top — sharp at any size, and placed per screen
 * shape (upper right on wide screens, top centre on phones) so it's never cropped or under the
 * headline. One landscape video; phones show its centre, where every scene keeps its subject.
 */
// Branding/Home banner footage.mov → H.264 1080p, no sound, ~5.5 MB (ffmpeg: -crf 29 -maxrate 2.6M, faststart)
const VIDEO = "/marketing/hero.mp4";
const POSTER = "/marketing/hero-poster.webp";

/** Seconds; the owner's cut list at 30 fps (e.g. 0:03:05 = 3 s + 5 frames). Trip details are made up. */
const f = (s: number, frames: number) => s + frames / 30;
const SCENES = [
  // Japan: Fuji fills the top of a phone screen, so the pass sits lower there (over the lake)
  { from: [0, 0], to: [3, 5], a: ["SIN", "SINGAPORE"], b: ["HND", "TOKYO"], km: "5,320km", temp: "14°C", days: "6D 5N", phone: "middle" },
  { from: [3, 6], to: [6, 11], a: ["KUL", "KUALA LUMPUR"], b: ["SGN", "HO CHI MINH CITY"], km: "1,060km", temp: "31°C", days: "4D 3N" },
  { from: [6, 12], to: [9, 4], a: ["HND", "TOKYO"], b: ["SIN", "SINGAPORE"], km: "5,320km", temp: "30°C", days: "4D 3N" },
  { from: [9, 5], to: [12, 10], a: ["CGK", "JAKARTA"], b: ["KUL", "TAMAN NEGARA"], km: "1,150km", temp: "27°C", days: "3D 2N" },
  { from: [12, 11], to: [14, 28], a: ["BKK", "BANGKOK"], b: ["ICN", "SEOUL"], km: "3,720km", temp: "18°C", days: "5D 4N" },
  // Thailand: the customer sits on the right, so the pass goes left on wide screens
  { from: [14, 29], to: [17, 28], a: ["KUL", "KUALA LUMPUR"], b: ["BKK", "BANGKOK"], km: "1,180km", temp: "33°C", days: "3D 2N", side: "left" },
].map((s) => ({ ...s, side: "side" in s ? s.side : "right", phone: "phone" in s ? s.phone : "top", start: f(s.from[0], s.from[1]), end: f(s.to[0], s.to[1] + 1) }));

/** Which scene's pass shows: fades in just after a cut and out just before the next. */
function useScene(video: React.RefObject<HTMLVideoElement | null>) {
  const [scene, setScene] = useState<number | null>(0);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const v = video.current;
      if (v && !v.paused) {
        const t = v.currentTime;
        const i = SCENES.findIndex((s) => t >= s.start + 0.2 && t < s.end - 0.35);
        setScene(i === -1 ? null : i);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [video]);
  return scene;
}

/**
 * The Trip pass (same layout as the share overlay, v0.5.18) in HTML, white on a frosted dark panel
 * so it reads on light and dark scenes. Sized in container units, so it scales with its box.
 */
function TripPass({ s }: { s: (typeof SCENES)[number] }) {
  const mono = "font-[family-name:var(--font-plex)] tracking-[0.1em]";
  const row = "flex items-center justify-between border-t-[0.28cqw] border-white h-[7.4cqw] text-[3.5cqw] tracking-[-0.03em]";
  return (
    <div className="@container w-full rounded-[5cqw] bg-black/30 backdrop-blur-md [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col px-[8cqw] pt-[6.5cqw] pb-[5cqw] text-white">
        <div className="flex items-start">
          {[s.a, s.b].map(([code, place], i) => (
            <div key={code + i} className="flex items-start">
              {i === 1 && (
                <span className="w-[12cqw] mt-[9cqw] flex justify-center">
                  <Plane className="w-[7cqw] h-[7cqw] rotate-45" fill="white" strokeWidth={0} aria-hidden />
                </span>
              )}
              <div className="flex flex-col w-[35cqw]">
                <span className={`${mono} text-[3.7cqw]`}>{i ? "TO" : "FROM"}</span>
                <span className="mt-[1.8cqw] text-[15.9cqw] leading-none font-bold tracking-[-0.03em]">{code}</span>
                <span className={`${mono} mt-[2.6cqw] font-medium whitespace-nowrap`} style={{ fontSize: `${Math.min(3.7, 35 / (place.length * 0.66))}cqw` }}>
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
        <Image src="/marketing/wordmark-white.svg" alt="" width={584} height={208} unoptimized className="mt-[5cqw] w-[17.6cqw] h-auto" />
      </div>
    </div>
  );
}

function HeroVideo({ video }: { video: React.RefObject<HTMLVideoElement | null> }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.pause();
  }, [video]);
  return (
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover"
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
  const scene = useScene(video);

  return (
    <section className="h-svh sm:px-2 sm:pt-2">
      <div className="relative h-full sm:rounded-[20px] overflow-hidden bg-[#1d2a36] text-white">
        <HeroVideo video={video} />
        {/* Keeps the headline readable over any scene */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent)]" aria-hidden />

        {/* One Trip pass per scene; the current one fades in. Phones: top centre. Wider: upper right (or left). */}
        {SCENES.map((s, i) => (
          <div
            key={i}
            className={`absolute left-1/2 -translate-x-1/2 w-[min(66vw,270px)] md:translate-x-0 md:top-[12%] md:w-[clamp(280px,23vw,400px)] ${
              s.phone === "middle" ? "top-[44%]" : "top-[76px]"
            } ${
              s.side === "left" ? "md:left-[3vw]" : "md:left-auto md:right-[3vw]"
            }`}
            aria-hidden={scene !== i}
          >
            <div
              className={`transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                scene === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <TripPass s={s} />
              <span className="sr-only">
                Fargo trip pass: {s.a[1]} to {s.b[1]}
              </span>
            </div>
          </div>
        ))}

        <HeroNav />
        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-6">
          <h1 className="text-[clamp(64px,14vw,200px)] leading-[0.8] font-bold tracking-[-0.06em]">
            <RevealWords lines={["Every trip", "starts here."]} />
          </h1>
        </div>
      </div>
    </section>
  );
}
