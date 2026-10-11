"use client";

import { useEffect, useRef, useState } from "react";
import { HeroNav } from "./site-nav";
import { RevealWords } from "./motion";

/**
 * Hero (LANDING.md → Redesign v6): the owner's video montage of six trips, each with a Fargo
 * share overlay, full screen; "Every trip starts here." huge at the bottom left.
 * Two exports: 16:9 for wider screens, 9:16 for phones (its own edit, so the overlays sit
 * inside the frame). Until the files exist (null), a dark background stands in.
 */
const HERO_VIDEO: { wide: string | null; tall: string | null; poster: string | null } = {
  wide: null, // e.g. "/marketing/hero-wide.mp4"
  tall: null, // e.g. "/marketing/hero-tall.mp4"
  poster: null, // a still from the first scene, shown while the video loads
};

/** Picks the phone or the wide video once, after mount, so only one file downloads. Paused for reduce motion. */
function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const tall = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off browser check after mount
    setSrc((tall ? HERO_VIDEO.tall : HERO_VIDEO.wide) ?? HERO_VIDEO.wide ?? HERO_VIDEO.tall);
  }, []);
  useEffect(() => {
    if (src && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ref.current?.pause();
  }, [src]);
  if (!src) return null;
  return (
    <video
      ref={ref}
      key={src}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={HERO_VIDEO.poster ?? undefined}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
  );
}

export function Hero() {
  return (
    <section className="h-svh sm:px-2 sm:pt-2">
      <div className="relative h-full sm:rounded-[20px] overflow-hidden bg-[linear-gradient(160deg,#1d2a36,#2b3a48_55%,#3a4d5f)] text-white">
        <HeroVideo />
        {/* Keeps the headline readable over any scene */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent)]" aria-hidden />
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
