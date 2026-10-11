"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Calendar, Camera, Cloud, Image as Photos, Map as MapIcon, Music, Settings, MessageCircle, Mail, Clock, StickyNote, type LucideIcon } from "lucide-react";

/**
 * "Put Fargo on your Home Screen": the top of a phone's home screen, built in code. Generic
 * look-alike tiles (not Apple's real icons); the Fargo icon pops into its spot when the
 * phone scrolls into view. Still for people with reduce motion on.
 */

type Tile = { label: string; icon: LucideIcon; bg: string; fg?: string; badge?: number };

const TILES: (Tile | "fargo")[] = [
  { label: "Messages", icon: MessageCircle, bg: "linear-gradient(#6be37a,#2cc04a)", badge: 3 },
  { label: "Mail", icon: Mail, bg: "linear-gradient(#5ab8ff,#1a7cf0)", badge: 12 },
  { label: "Photos", icon: Photos, bg: "#ffffff", fg: "#f2a33a" },
  { label: "Calendar", icon: Calendar, bg: "#ffffff", fg: "#e2483d" },
  { label: "Camera", icon: Camera, bg: "linear-gradient(#d9dadd,#a9abb0)", fg: "#2b2b2b" },
  { label: "Maps", icon: MapIcon, bg: "linear-gradient(#8fe08a,#4cb7e8)" },
  "fargo",
  { label: "Weather", icon: Cloud, bg: "linear-gradient(#4aa8ff,#1c63d6)" },
  { label: "Music", icon: Music, bg: "linear-gradient(#ff6b81,#f4364c)" },
  { label: "Clock", icon: Clock, bg: "#111111" },
  { label: "Notes", icon: StickyNote, bg: "linear-gradient(#fff3a6,#ffd84a)", fg: "#8a6d00" },
  { label: "Settings", icon: Settings, bg: "linear-gradient(#b8bcc4,#7d828c)" },
];

export function HomeScreenMock() {
  const ref = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setAdded(true), 450);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -25% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-[460px] sm:h-[520px] overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#e9f0f8,#dfe8f3)]">
      {/* Phone, cropped at the bottom like a product shot */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[330px] sm:w-[360px] h-[720px] rounded-[56px] bg-[#1c1d20] p-[11px] shadow-[0_30px_70px_rgba(23,32,51,0.28)]">
        <div className="relative h-full rounded-[46px] overflow-hidden bg-[linear-gradient(170deg,#1f3b5a_0%,#3c5f86_45%,#e9b48c_100%)]">
          {/* Status bar + Dynamic Island */}
          <div className="flex items-center justify-between px-7 pt-4 text-white text-[14px] font-semibold">
            <span>9:41</span>
            <span className="w-[96px] h-[28px] rounded-full bg-black" aria-hidden />
            <span className="flex items-center gap-1" aria-hidden>
              <span className="flex items-end gap-[2px]">
                {[5, 7, 9, 11].map((h) => (
                  <span key={h} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />
                ))}
              </span>
              <span className="ml-1 w-[22px] h-[11px] rounded-[3px] border border-white/80 p-[1px]">
                <span className="block h-full w-3/4 rounded-[1px] bg-white" />
              </span>
            </span>
          </div>

          {/* App grid */}
          <div className="grid grid-cols-4 gap-x-4 gap-y-5 px-5 pt-8">
            {TILES.map((t) =>
              t === "fargo" ? (
                <div key="fargo" className="flex flex-col items-center gap-1.5">
                  <div
                    className={`relative w-[62px] h-[62px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                      added ? "scale-100 opacity-100" : "scale-0 opacity-0 motion-reduce:scale-100 motion-reduce:opacity-100"
                    }`}
                  >
                    <Image src="/icon-512x512.png" alt="Fargo app icon on a phone's Home Screen" width={124} height={124} className="w-full h-full rounded-[14px] ring-2 ring-white/70" />
                  </div>
                  <span className={`text-[11px] text-white font-medium transition-opacity duration-500 delay-300 ${added ? "opacity-100" : "opacity-0 motion-reduce:opacity-100"}`}>Fargo</span>
                </div>
              ) : (
                <div key={t.label} className="flex flex-col items-center gap-1.5" aria-hidden>
                  <div className="relative w-[62px] h-[62px] rounded-[14px] flex items-center justify-center" style={{ background: t.bg }}>
                    <t.icon size={30} strokeWidth={1.9} color={t.fg ?? "#ffffff"} />
                    {t.badge && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#ff3b30] text-white text-[12px] font-semibold flex items-center justify-center">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-white/90">{t.label}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
