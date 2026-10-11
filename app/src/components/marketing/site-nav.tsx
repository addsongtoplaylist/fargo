"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLandingBase, useSignedIn } from "./use-marketing";

/**
 * Landing page navigation (LANDING.md → Redesign v6):
 * - HeroNav: see-through bar over the hero video;
 * - SolidNav: the same bar in ink on white, for Privacy / Terms;
 * - FloatingNav: Wolverine's black pill, fixed at the top once you scroll past the first screen.
 * Section links stay on the page you're on (/ or /home); signed-in people get My trips.
 */

function useLinks() {
  const base = useLandingBase();
  const signedIn = useSignedIn();
  return {
    links: [
      { href: `${base}#features`, label: "Features" },
      { href: `${base}#install`, label: "Add to phone" },
      { href: `${base}#faq`, label: "FAQ" },
    ],
    cta: signedIn ? { href: "/trips", label: "My trips" } : { href: "/sign-in", label: "Start planning" },
    home: base,
  };
}

function Bar({ tone }: { tone: "light" | "dark" }) {
  const { links, cta, home } = useLinks();
  const text = tone === "light" ? "text-white/85 hover:text-white" : "text-[#3d3d3d] hover:text-[#0c0c0c]";
  return (
    <nav className="flex items-center justify-between px-5 sm:px-8 py-6">
      <Link href={home} aria-label="Fargo home">
        <Image src={tone === "light" ? "/marketing/wordmark-white.svg" : "/marketing/wordmark-blue.svg"} alt="Fargo" width={584} height={208} unoptimized className="h-7 w-auto" priority />
      </Link>
      <div className="flex items-center gap-6 text-[15px]">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className={`hidden sm:inline ${text}`}>
            {l.label}
          </Link>
        ))}
        <Link href={cta.href} className="rounded-[10px] bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover">
          {cta.label}
        </Link>
      </div>
    </nav>
  );
}

export function HeroNav() {
  return (
    <div className="absolute inset-x-0 top-0 z-10">
      <Bar tone="light" />
    </div>
  );
}

export function SolidNav() {
  return <Bar tone="dark" />;
}

/** The black pill that slides in once the visitor has scrolled past the first screen. */
export function FloatingNav() {
  const { links, cta, home } = useLinks();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-3 z-50 flex justify-center px-3 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
      aria-hidden={!shown}
    >
      <nav className="flex items-center gap-1 rounded-[14px] bg-[#0c0c0c]/90 backdrop-blur-md p-1.5 pl-3 text-[14px] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <Link href={home} aria-label="Fargo home" tabIndex={shown ? 0 : -1} className="pr-2">
          <Image src="/icon-512x512.png" alt="" width={28} height={28} className="rounded-[7px]" />
        </Link>
        {links.map((l) => (
          <Link key={l.label} href={l.href} tabIndex={shown ? 0 : -1} className="hidden sm:inline px-3 py-1.5 text-white/80 hover:text-white">
            {l.label}
          </Link>
        ))}
        <Link href={cta.href} tabIndex={shown ? 0 : -1} className="ml-1 inline-flex items-center gap-1.5 rounded-[10px] bg-brand px-3.5 py-1.5 font-medium hover:bg-brand-hover">
          {cta.label}
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </nav>
    </div>
  );
}

/** Black footer: big links, legal row, wordmark at half width. */
export function SiteFooter() {
  const { home } = useLinks();
  const signedIn = useSignedIn();
  const links = [
    { href: `${home}#features`, label: "Features" },
    { href: `${home}#install`, label: "Add to Home Screen" },
    { href: `${home}#faq`, label: "Questions" },
    signedIn ? { href: "/trips", label: "My trips" } : { href: "/sign-in", label: "Sign in" },
  ];
  const wrap = "mx-auto max-w-[1280px] px-4 sm:px-8";
  const mono = "font-[family-name:var(--font-plex)] uppercase tracking-[0.1em]";
  return (
    <footer className="bg-[#0c0c0c] text-white mt-2">
      <div className={`${wrap} pt-16 pb-10 grid md:grid-cols-2 gap-12`}>
        <div className="flex flex-col gap-5 max-w-[340px]">
          <Image src="/icon-512x512.png" alt="" width={52} height={52} className="rounded-[12px]" />
          <p className="text-[15px] leading-snug text-white/75">Made for friends who travel together. Plan the days, share the plan and keep the costs fair.</p>
        </div>
        <nav aria-label="Fargo" className="flex flex-col">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center justify-between border-b border-white/15 py-2.5 text-[clamp(22px,2.2vw,30px)] font-medium tracking-[-0.03em] text-white/60 hover:text-white transition-colors"
            >
              {l.label}
              <ArrowUpRight size={20} className="opacity-60" aria-hidden />
            </Link>
          ))}
        </nav>
      </div>
      <div className={`${wrap} pb-6 flex flex-wrap gap-x-6 gap-y-2 ${mono} text-[11px] text-white/55`}>
        <span>© 2026 Fargo</span>
        <Link href="/privacy" className="hover:text-white">Privacy</Link>
        <Link href="/terms" className="hover:text-white">Terms</Link>
      </div>
      {/* Wordmark at half the page width, left-aligned (vector, Branding/Logo-wordmark.svg trimmed to the letters) */}
      <div className={`${wrap} pb-8`}>
        <Image src="/marketing/wordmark-white.svg" alt="Fargo" width={584} height={208} unoptimized className="w-1/2 h-auto" />
      </div>
    </footer>
  );
}
