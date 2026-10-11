"use client";

import Image from "next/image";
import { useRef } from "react";

const STAMPS = [
  { file: "/stamps/MY/penang.png", place: "Penang", country: "Malaysia" },
  { file: "/stamps/JP/kyoto.png", place: "Kyoto", country: "Japan" },
  { file: "/stamps/KR/seoul.png", place: "Seoul", country: "South Korea" },
  { file: "/stamps/TH/bangkok.png", place: "Bangkok", country: "Thailand" },
  { file: "/stamps/VN/hoi-an.png", place: "Hoi An", country: "Vietnam" },
  { file: "/stamps/ID/bali.png", place: "Bali", country: "Indonesia" },
  { file: "/stamps/SG/country-1.png", place: "Singapore", country: "Singapore" },
  { file: "/stamps/MY/sabah.png", place: "Sabah", country: "Malaysia" },
  { file: "/stamps/FR/country-1.png", place: "France", country: "France" },
  { file: "/stamps/JP/hokkaido.png", place: "Hokkaido", country: "Japan" },
];

/** "Collect them all": a row of real library stamps with Prev / Next (Wolverine's news carousel). */
export function StampCarousel() {
  const row = useRef<HTMLDivElement>(null);
  const go = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-[clamp(72px,10vw,140px)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h2 className="text-[clamp(30px,4vw,52px)] leading-none font-bold tracking-[-0.03em] text-[#0c0c0c]">Collect them all</h2>
          <span className="font-[family-name:var(--font-plex)] text-xs uppercase tracking-[0.12em] text-[#6b6b6b]">124 stamps · 30 countries</span>
        </div>
        <div className="flex gap-5 text-[15px] text-[#6b6b6b]">
          <button type="button" onClick={() => go(-1)} className="hover:text-[#0c0c0c]">Prev.</button>
          <button type="button" onClick={() => go(1)} className="hover:text-[#0c0c0c]">Next</button>
        </div>
      </div>
      <div ref={row} className="mt-8 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-8 scroll-px-4 sm:scroll-px-8">
        {STAMPS.map((s) => (
          <figure key={s.file} className="snap-start shrink-0 w-[62vw] sm:w-[300px] flex flex-col gap-3">
            <div className="aspect-square rounded-[20px] bg-[#f6efe2] flex items-center justify-center p-8">
              <div className="relative w-full h-full">
                <Image src={s.file} alt={`${s.place} stamp`} fill sizes="300px" className="object-contain" />
              </div>
            </div>
            <figcaption className="font-[family-name:var(--font-plex)] text-[11px] uppercase tracking-[0.1em] text-[#6b6b6b]">
              {s.place === s.country ? s.country : `${s.place} · ${s.country}`}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
