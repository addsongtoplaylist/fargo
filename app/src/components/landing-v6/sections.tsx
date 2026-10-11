import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Drift, FadeUp, RevealWords } from "./motion";
import { PhoneFrame } from "@/components/marketing/frames";
import { HomeScreenMock } from "./home-screen";

/**
 * Landing page v6 (LANDING.md → Redesign v6, reference wolverineworldwide.com): giant tight
 * Sora type, white page, black ink, Fargo blue for buttons, IBM Plex Mono for small labels,
 * photography and stamps for colour. Draft at /v6 until the owner approves it.
 */

export const INK = "#0c0c0c";
export const MONO = "font-[family-name:var(--font-plex)] uppercase tracking-[0.1em]";
const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8";
const MUTED = "text-[#6b6b6b]";

/** Blue pill with an arrow — the one button style on the page. */
export function Pill({ href, children, tone = "blue" }: { href: string; children: React.ReactNode; tone?: "blue" | "white" | "grey" }) {
  const colours =
    tone === "white" ? "bg-white text-[#0c0c0c] hover:bg-[#ececec]" : tone === "grey" ? "bg-[#ececec] text-[#0c0c0c] hover:bg-[#e0e0e0]" : "bg-brand text-white hover:bg-brand-hover";
  return (
    <Link href={href} className={`inline-flex items-center gap-3 rounded-[12px] px-5 h-12 text-[15px] font-medium transition-colors ${colours}`}>
      {children}
      <ArrowRight size={16} strokeWidth={2} aria-hidden />
    </Link>
  );
}

/** The real Home Screen icon, rounded like a phone shows it. */
export function AppIcon({ size = 64, label = false }: { size?: number; label?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center gap-1.5">
      <Image src="/icon-512x512.png" alt={label ? "" : "Fargo app icon"} width={size} height={size} className="shadow-[0_8px_20px_rgba(0,113,188,0.22)]" style={{ borderRadius: size * 0.225 }} />
      {label && <span className="text-[12px] font-medium" style={{ color: INK }}>Fargo</span>}
    </span>
  );
}

// ── 1. Statement ───────────────────────────────────────────────

export function Statement() {
  return (
    <section className={`${WRAP} py-[clamp(96px,14vw,200px)] grid md:grid-cols-2 gap-8`}>
      <div className="flex flex-col items-start gap-4">
        <span className="flex items-center gap-4">
          <AppIcon size={77} />
          <Image src="/marketing/wordmark-blue.svg" alt="Fargo" width={584} height={208} unoptimized className="h-[52px] w-auto" />
        </span>
        <span className={`${MONO} text-[15px] ${MUTED}`}>Trip planner for friends</span>
      </div>
      <FadeUp className="flex flex-col gap-8">
        <p className="text-[clamp(24px,2.6vw,36px)] leading-[1.08] font-bold tracking-[-0.03em]" style={{ color: INK }}>
          Before the bags, the flights and the photos, every trip starts here.
        </p>
        <div>
          <Pill href="/sign-in">Start planning</Pill>
        </div>
      </FadeUp>
    </section>
  );
}

// ── 2. Galaxy ──────────────────────────────────────────────────

type Floater = { src: string; alt: string; x: string; y: string; w: number; speed: number; stamp?: boolean };

/**
 * Photos scattered around the headline (no stamps — they stay a Passport surprise); each drifts at its own speed. Photos are
 * Unsplash (free licence; ids in LANDING.md → Redesign v6) and never repeat the feature cards.
 */
const G = "/marketing/galaxy/";
const FLOATERS: Floater[] = [
  { src: `${G}hikers-trail.webp`, alt: "Friends with backpacks on a mountain trail", x: "3%", y: "6%", w: 130, speed: 0.35 },
  { src: `${G}night-market.webp`, alt: "A night market", x: "23%", y: "0%", w: 105, speed: 0.2 },
  { src: `${G}marina-bay-sands.webp`, alt: "Marina Bay Sands, Singapore", x: "45%", y: "3%", w: 120, speed: 0.45 },
  { src: `${G}korean-dinner.webp`, alt: "Friends eating outside a Korean restaurant at night", x: "66%", y: "7%", w: 112, speed: 0.3 },
  { src: `${G}fuji.webp`, alt: "Mount Fuji reflected in a lake", x: "84%", y: "2%", w: 135, speed: 0.5 },
  { src: `${G}ao-dai.webp`, alt: "Two women in ao dai and conical hats, Vietnam", x: "1%", y: "38%", w: 108, speed: -0.15 },
  { src: `${G}hong-kong.webp`, alt: "Hong Kong skyline over Victoria Harbour", x: "88%", y: "36%", w: 118, speed: 0.25 },
  { src: `${G}lanterns.webp`, alt: "Lanterns in Hoi An at night", x: "6%", y: "70%", w: 125, speed: -0.3 },
  { src: `${G}gyeongbokgung.webp`, alt: "Gyeongbokgung Palace, Seoul", x: "24%", y: "84%", w: 112, speed: -0.45 },
  { src: `${G}ulun-danu.webp`, alt: "Pura Ulun Danu Bratan, Bali", x: "42%", y: "90%", w: 128, speed: -0.2 },
  { src: `${G}hoi-an-bikes.webp`, alt: "Friends cycling through Hoi An", x: "62%", y: "80%", w: 118, speed: -0.35 },
  { src: `${G}floating-market.webp`, alt: "A floating market boat from above, Thailand", x: "80%", y: "66%", w: 112, speed: -0.1 },
  { src: `${G}kek-lok-si.webp`, alt: "Kek Lok Si temple, Penang", x: "90%", y: "88%", w: 110, speed: -0.4 },
  { src: `${G}taipei-street.webp`, alt: "A busy street in Taipei at night", x: "32%", y: "16%", w: 96, speed: 0.15 },
  { src: `${G}tokyo-night.webp`, alt: "Tokyo at night from above", x: "74%", y: "22%", w: 100, speed: 0.4 },
  { src: `${G}friends-boat.webp`, alt: "Friends on a boat over turquoise water", x: "13%", y: "22%", w: 92, speed: -0.25 },
  { src: `${G}street-food-fire.webp`, alt: "A street food cook with flames", x: "93%", y: "58%", w: 90, speed: 0.2 },
  { src: `${G}ha-long-bay.webp`, alt: "Boats in Ha Long Bay, Vietnam", x: "12%", y: "54%", w: 94, speed: 0.3 },
  { src: `${G}beach-swim.webp`, alt: "Friends swimming at sunset", x: "74%", y: "94%", w: 100, speed: -0.25 },
];

export function Galaxy() {
  return (
    <section id="features" className="relative overflow-hidden min-h-[clamp(720px,125vh,1200px)] flex items-center scroll-mt-16">
      {FLOATERS.map((f) => (
        <Drift key={f.src} speed={f.speed} className="absolute" style={{ left: f.x, top: f.y, width: `clamp(${Math.round(f.w * 0.6)}px, ${(f.w / 12.8).toFixed(1)}vw, ${f.w}px)` }}>
          <Image
            src={f.src}
            alt={f.alt}
            width={f.w * 2}
            height={f.stamp ? f.w * 2 : Math.round(f.w * 2.5)}
            sizes={`${f.w}px`}
            className={f.stamp ? "w-full h-auto" : "w-full h-auto aspect-[4/5] object-cover"}
          />
        </Drift>
      ))}
      <div className={`${WRAP} relative w-full flex flex-col items-center gap-10 pointer-events-none`}>
        <h2 className="text-[clamp(56px,11vw,160px)] leading-[0.82] font-bold tracking-[-0.055em] text-center" style={{ color: INK }}>
          <RevealWords lines={["Your trip,", "your way."]} />
        </h2>
        {/* Who it's for: sold to the friend who plans (BRAND.md voice) */}
        <FadeUp className="max-w-[560px] text-center">
          <p className="text-[clamp(17px,1.5vw,20px)] leading-snug font-medium" style={{ color: INK }}>
            For the friend who always ends up planning. Build the days, send one invite link, and everyone sees the same plan.
          </p>
        </FadeUp>
        <div className="pointer-events-auto">
          <Pill href="#cards" tone="grey">See what&apos;s inside</Pill>
        </div>
      </div>
    </section>
  );
}

// ── 3. Feature cards ───────────────────────────────────────────

const FEATURES = [
  {
    n: "01",
    title: "Planner",
    body: "A day-by-day plan your whole group shares. Everyone sees the same schedule, what's on, where and when, so nobody's left asking.",
    photo: "/marketing/photo-planner.webp",
    photoAlt: "Gardens by the Bay, Singapore",
    screen: "/marketing/screen-schedule.webp",
    screenAlt: "Fargo schedule with places and times",
  },
  {
    n: "02",
    title: "Travel buddies",
    body: "Invite your friends with one link. They suggest ideas, you decide what makes the schedule.",
    photo: "/marketing/photo-buddies-5.webp",
    photoAlt: "Friends hiking together above the sea",
    screen: "/marketing/screen-prep.webp",
    screenAlt: "Fargo Prep with a packing list and ideas",
  },
  {
    n: "03",
    title: "Shared costs",
    body: "Everyone adds what they paid along the way. Fargo keeps it fair, with no awkward chat at the end.",
    photo: "/marketing/photo-costs-3.webp",
    photoAlt: "Friends sharing plates of food around a long table",
    screen: "/marketing/screen-money.webp",
    screenAlt: "Fargo Money with the group split",
  },
  {
    n: "04",
    title: "Passport",
    body: "Collect a stamp from every trip. See your countries, trips and travel buddies add up, then share a trip card.",
    photo: "/marketing/photo-passport-3.webp",
    photoAlt: "A camera, sunglasses and a bag packed for a trip",
    screen: "/marketing/screen-passport.webp",
    screenAlt: "Fargo Passport with stamps and travel stats",
  },
];

/** Four big black cards (Wolverine's annual-report card): photo, title, text, and the real screen. */
export function FeatureCards() {
  return (
    <section id="cards" className={`${WRAP} flex flex-col gap-4 sm:gap-6 scroll-mt-20`}>
      {FEATURES.map((f) => (
        <FadeUp key={f.n}>
          <article className="grid md:grid-cols-2 gap-4 md:gap-6 rounded-[20px] bg-[#0c0c0c] text-white p-1.5 sm:p-2">
            {/* Photo with the real app screen on top of it (like the v5 switcher) */}
            <div className="relative rounded-[16px] overflow-hidden flex justify-center pt-10 pb-8 sm:pt-14 sm:pb-10 md:min-h-[600px] md:items-center">
              <Image src={f.photo} alt={f.photoAlt} fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
              <PhoneFrame label={f.screenAlt} src={f.screen} className="relative !w-[210px] !h-[436px] sm:!w-[250px] sm:!h-[520px] !rounded-[34px] !p-1.5 [&>div]:!rounded-[28px] !shadow-[0_24px_60px_rgba(0,0,0,0.45)]" />
            </div>
            <div className="flex flex-col gap-6 p-4 sm:p-6 md:pl-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[clamp(32px,3.6vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]">{f.title}</h3>
                <span className={`${MONO} text-xs text-white/60`}>{f.n}</span>
              </div>
              <div className="mt-auto flex flex-col gap-6">
                <p className="text-[clamp(16px,1.4vw,19px)] leading-snug text-white/85 max-w-[380px]">{f.body}</p>
                <div>
                  <Pill href="/sign-in" tone="white">Try it out</Pill>
                </div>
              </div>
            </div>
          </article>
        </FadeUp>
      ))}
    </section>
  );
}

// ── 4. Journey ─────────────────────────────────────────────────

const STAGES = [
  { label: "Before", title: "Plan it together", body: "Plan the days, places and times. Share one invite link; friends suggest ideas.", src: "/marketing/illus-before.webp", alt: "A desk with a calendar, suitcases and a map pin" },
  { label: "During", title: "Fargo comes along", body: "Today's plan in your pocket, plus good food near your stay.", src: "/marketing/illus-during.webp", alt: "An open guidebook, a map and a clock" },
  { label: "After", title: "Square it up", body: "Everyone adds what they paid. See who pays who back, then collect your stamp.", src: "/marketing/illus-after.webp", alt: "A calculator, a suitcase and a piggy bank" },
];

export function Journey() {
  return (
    <section className={`${WRAP} py-[clamp(96px,14vw,200px)] flex flex-col gap-14`}>
      <div className="grid md:grid-cols-2 gap-6">
        <h2 className="text-[clamp(30px,4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]" style={{ color: INK }}>
          One trip,
          <br />
          start to finish.
        </h2>
        <div className="flex flex-col items-start gap-4">
          <AppIcon size={64} />
          <p className={`text-[clamp(18px,1.6vw,22px)] leading-snug font-medium ${MUTED} max-w-[480px]`}>
            Fargo is with you from the first idea to the last settle-up.
          </p>
        </div>
      </div>
      <ol className="grid md:grid-cols-3 gap-10 md:gap-6">
        {STAGES.map((s, i) => (
          <FadeUp key={s.label} delay={i * 120}>
            <li className="flex flex-col gap-4 border-t border-[#d9d9d9] pt-5">
              <span className={`${MONO} text-xs ${MUTED}`}>
                0{i + 1} · {s.label}
              </span>
              <Image src={s.src} alt={s.alt} width={480} height={360} sizes="(min-width: 768px) 400px, 90vw" className="w-full h-auto" unoptimized />
              <h3 className="text-[24px] font-bold tracking-[-0.03em]" style={{ color: INK }}>
                {s.title}
              </h3>
              <p className={`text-[15px] leading-snug ${MUTED}`}>{s.body}</p>
            </li>
          </FadeUp>
        ))}
      </ol>
    </section>
  );
}

// ── 5. Passport (numbers + a few stamps) ───────────────────────

/** Only a few real stamps — the rest of the library stays a surprise. */
const PASSPORT_STAMPS = [
  { file: "/stamps/MY/penang.png", alt: "Penang stamp", tilt: -8 },
  { file: "/stamps/JP/kyoto.png", alt: "Kyoto stamp", tilt: 6 },
  { file: "/stamps/TH/bangkok.png", alt: "Bangkok stamp", tilt: -4 },
];

/**
 * A sample traveller's Passport, laid out like the app's Passport screen (cream stamp page, the
 * days-away card with its progress bar, a highlight row) — three stamps only, no spoilers.
 */
export function PassportSection() {
  return (
    <section className={`${WRAP} py-[clamp(48px,6vw,96px)]`}>
      <div className="border-y border-[#d9d9d9] grid md:grid-cols-2">
        <div className="py-8 md:pr-8 flex flex-col gap-4 md:border-r border-[#d9d9d9]">
          <h2 className="text-[clamp(30px,4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]" style={{ color: INK }}>
            Collect a stamp
            <br />
            from every trip.
          </h2>
          <p className={`text-[17px] leading-snug ${MUTED} max-w-[400px]`}>
            When a trip ends, its stamp goes into your Passport, with your days away, countries and buddies. Which stamp? You&apos;ll see when you get there.
          </p>
        </div>

        <div className="py-8 md:pl-8">
          {/* The app's Passport screen, as cards on the app's page grey */}
          <FadeUp className="rounded-[24px] bg-page p-3 sm:p-4 flex flex-col gap-2.5 max-w-[460px] mx-auto">
            <span className="px-1 pt-1 text-[26px] font-bold tracking-[-0.5px] text-fg">Passport</span>

            <div className="rounded-card bg-[#f6efe2] p-3.5">
              <div className="flex items-baseline justify-between mx-0.5 mb-3">
                <span className="text-[15px] font-semibold text-[#5b4a2e]">
                  Stamps <span className="font-normal text-[#8a7655]">· 6</span>
                </span>
                <span className="text-[13px] font-semibold text-brand">See all</span>
              </div>
              <div className="grid grid-cols-4 gap-3 items-center py-1">
                {PASSPORT_STAMPS.map((st) => (
                  <Image key={st.file} src={st.file} alt={st.alt} width={160} height={160} sizes="90px" className="w-full h-auto" style={{ transform: `rotate(${st.tilt}deg)` }} />
                ))}
                <div className="aspect-square rounded-[16px] border-2 border-dashed border-[#d9cdb6] flex items-center justify-center text-[22px] font-bold text-[#b3a487] rotate-3" title="Your next trip">
                  ?
                </div>
              </div>
            </div>

            <div className="rounded-card bg-surface p-4">
              <p className="leading-none">
                <span className="text-[40px] font-bold text-brand tabular-nums">38</span>
                <span className="text-base font-semibold text-fg ml-2">days away</span>
              </p>
              <div className="mt-3.5 h-2 rounded-full bg-brand-soft overflow-hidden" aria-hidden>
                <div className="h-full w-[10.4%] rounded-full bg-brand" />
              </div>
              <p className="text-xs text-fg-muted mt-1.5">38 of 365 days in 2026 spent travelling</p>
              <div className="flex mt-4 pt-3.5 border-t border-line">
                {[
                  ["4", "countries"],
                  ["6", "trips"],
                  ["5", "buddies"],
                ].map(([v, l], i) => (
                  <div key={l} className={`flex-1 ${i ? "border-l border-line pl-4" : ""}`}>
                    <p className="text-xl font-bold text-fg tabular-nums leading-none">{v}</p>
                    <p className="text-xs text-fg-muted mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-card bg-surface px-4 py-3 flex items-center gap-3">
              <span className="w-[34px] h-[34px] rounded-full bg-brand-soft text-brand text-sm font-bold flex items-center justify-center">A</span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-fg">Most trips with Ali</span>
                <span className="text-xs text-fg-muted">2 trips together</span>
              </span>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── 6. Install + FAQ ───────────────────────────────────────────

const INSTALL = [
  { title: "iPhone · Safari", steps: ["Open fargotravel.vercel.app in Safari", "Tap Share", "Tap Add to Home Screen → Add"] },
  { title: "Android · Chrome", steps: ["Open fargotravel.vercel.app in Chrome", "Tap Install app (or ⋮ → Add to Home screen)", "Tap Install"] },
];

const QUESTIONS = [
  { q: "Is Fargo free?", a: "Yes." },
  { q: "Do I need to download an app?", a: "No. It runs in your browser. Add it to your Home Screen for the full-screen app feel." },
  { q: "Do my travel buddies need to sign up?", a: "No. Add them by name and they're part of the trip straight away. They can join with the invite link any time." },
  { q: "Who can change the plan?", a: "The planner edits the schedule. Buddies suggest ideas and add what they paid." },
  { q: "Which currencies?", a: "Any. Add costs in the local currency; Fargo converts them with the rate you set for the trip." },
  { q: "Who can see the costs we add?", a: "Only people on the trip. Share links show the plan, never the costs." },
];

export function InstallAndFaq() {
  return (
    <>
      <section id="install" className={`${WRAP} py-[clamp(96px,12vw,170px)] grid md:grid-cols-2 gap-10 scroll-mt-16`}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(30px,4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]" style={{ color: INK }}>
              Put Fargo on your Home Screen.
            </h2>
            <p className={`text-[17px] leading-snug ${MUTED} max-w-[420px]`}>No App Store needed. Add it once and Fargo opens full screen, just like an app.</p>
          </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {INSTALL.map((c) => (
            <div key={c.title} className="rounded-[20px] bg-[#f3f3f3] p-6 flex flex-col gap-4">
              <span className={`${MONO} text-xs ${MUTED}`}>{c.title}</span>
              <ol className="flex flex-col gap-3">
                {c.steps.map((s, i) => (
                  <li key={s} className="grid grid-cols-[24px_1fr] text-[15px] leading-snug" style={{ color: INK }}>
                    <span className={`${MONO} text-xs ${MUTED} pt-0.5`}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        </div>
        {/* The Fargo icon pops onto a phone's Home Screen */}
        <HomeScreenMock />
      </section>

      <section id="faq" className={`${WRAP} pb-[clamp(96px,12vw,170px)] grid md:grid-cols-2 gap-10 scroll-mt-16`}>
        <h2 className="text-[clamp(30px,4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]" style={{ color: INK }}>
          Questions
        </h2>
        <div className="flex flex-col border-t border-[#d9d9d9]">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-b border-[#d9d9d9] py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[clamp(18px,1.6vw,22px)] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden" style={{ color: INK }}>
                {q}
                <span className="text-2xl font-normal transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className={`mt-3 text-[15px] leading-relaxed ${MUTED} max-w-[520px]`}>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

// ── 7. Closing ─────────────────────────────────────────────────

export function Closing() {
  return (
    <section className="px-0 sm:px-2">
      <div className="relative overflow-hidden sm:rounded-[20px] min-h-[clamp(560px,90vh,860px)] flex items-center justify-center text-center text-white">
        <Image src="/marketing/photo-closing-plane.webp" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative px-4 flex flex-col items-center gap-8">
          <h2 className="text-[clamp(56px,9vw,136px)] leading-[0.85] font-bold tracking-[-0.055em]">
            {/* Placeholder line — the owner picks the closing wording (LANDING.md R3) */}
            <RevealWords lines={["Where to", "next?"]} />
          </h2>
          <p className="text-[17px] leading-snug text-white/90 max-w-[420px]">Start a trip in a minute. Invite your friends when you&apos;re ready. It&apos;s free.</p>
          <Pill href="/sign-in" tone="white">
            Start planning
          </Pill>
        </div>
      </div>
    </section>
  );
}

// ── 8. Footer ──────────────────────────────────────────────────

export function Footer() {
  const links = [
    { href: "#features", label: "Features" },
    { href: "#install", label: "Add to Home Screen" },
    { href: "#faq", label: "Questions" },
    { href: "/sign-in", label: "Sign in" },
  ];
  return (
    <footer className="bg-[#0c0c0c] text-white mt-2">
      <div className={`${WRAP} pt-16 pb-10 grid md:grid-cols-2 gap-12`}>
        <div className="flex flex-col gap-5 max-w-[340px]">
          <Image src="/mascot.png" alt="" width={52} height={52} className="rounded-[12px]" />
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
      <div className={`${WRAP} pb-6 flex flex-wrap gap-x-6 gap-y-2 ${MONO} text-[11px] text-white/55`}>
        <span>© 2026 Fargo</span>
        <Link href="/privacy" className="hover:text-white">Privacy</Link>
        <Link href="/terms" className="hover:text-white">Terms</Link>
      </div>
      {/* Wordmark at half the page width, left-aligned (vector, Branding/Logo-wordmark.svg trimmed to the letters) */}
      <div className={`${WRAP} pb-8`}>
        <Image src="/marketing/wordmark-white.svg" alt="Fargo" width={584} height={208} unoptimized className="w-1/2 h-auto" />
      </div>
    </footer>
  );
}
