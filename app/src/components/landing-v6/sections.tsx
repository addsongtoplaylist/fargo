import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { Drift, FadeUp, RevealWords } from "./motion";
import { PhoneFrame } from "@/components/marketing/frames";

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

// ── 1. Statement ───────────────────────────────────────────────

export function Statement() {
  return (
    <section className={`${WRAP} py-[clamp(96px,14vw,200px)] grid md:grid-cols-2 gap-8`}>
      <span className={`${MONO} text-xs ${MUTED}`}>Fargo · trip planner for friends</span>
      <FadeUp className="flex flex-col gap-8">
        <p className="text-[clamp(24px,2.6vw,36px)] leading-[1.08] font-bold tracking-[-0.03em]" style={{ color: INK }}>
          Fargo keeps the plan, the places and the people in one trip. Plan the days together, keep the costs fair, and
          collect a stamp from every place you go.
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

/** Photos and stamps scattered around the headline; each drifts at its own speed. */
const FLOATERS: Floater[] = [
  { src: "/marketing/photo-planner.webp", alt: "Gardens by the Bay, Singapore", x: "4%", y: "6%", w: 120, speed: 0.35 },
  { src: "/stamps/JP/kyoto.png", alt: "Kyoto stamp", x: "30%", y: "2%", w: 96, speed: 0.15, stamp: true },
  { src: "/marketing/photo-buddies-5.webp", alt: "Friends hiking above the sea", x: "62%", y: "4%", w: 110, speed: 0.5 },
  { src: "/stamps/MY/penang.png", alt: "Penang stamp", x: "86%", y: "12%", w: 104, speed: 0.25, stamp: true },
  { src: "/marketing/photo-costs-3.webp", alt: "Friends sharing plates around a table", x: "10%", y: "58%", w: 132, speed: -0.2 },
  { src: "/stamps/KR/seoul.png", alt: "Seoul stamp", x: "2%", y: "34%", w: 84, speed: 0.45, stamp: true },
  { src: "/marketing/photo-passport-3.webp", alt: "Camera, sunglasses and a bag packed for a trip", x: "78%", y: "52%", w: 128, speed: -0.3 },
  { src: "/stamps/TH/bangkok.png", alt: "Bangkok stamp", x: "52%", y: "70%", w: 92, speed: -0.1, stamp: true },
  { src: "/marketing/photo-closing-plane.webp", alt: "The view from a plane window", x: "30%", y: "80%", w: 150, speed: -0.4 },
  { src: "/stamps/ID/bali.png", alt: "Bali stamp", x: "90%", y: "78%", w: 88, speed: 0.3, stamp: true },
  { src: "/stamps/VN/hoi-an.png", alt: "Hoi An stamp", x: "70%", y: "28%", w: 80, speed: -0.25, stamp: true },
];

export function Galaxy() {
  return (
    <section id="features" className="relative overflow-hidden min-h-[clamp(640px,110vh,1080px)] flex items-center scroll-mt-16">
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
            For the friend who always ends up planning. Build the days, send one invite link, and everyone sees the same
            plan. No more digging through 300 messages to find what time dinner is.
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
    body: "A day-by-day itinerary built around what you want to do, not a tour package. During the trip it opens on today.",
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
  { label: "During", title: "Enjoy every day", body: "Fargo opens on today: what's now and what's next, plus good food near your stay.", src: "/marketing/illus-during.webp", alt: "An open guidebook, a map and a clock" },
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
        <p className={`text-[clamp(18px,1.6vw,22px)] leading-snug font-medium ${MUTED} max-w-[480px]`}>
          Fargo is with you from the first idea to the last settle-up.
        </p>
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

/** Wolverine's "Market Snapshot", as a sample traveller's Passport with their stamps. */
export function PassportSection() {
  const stats = [
    { label: "Countries", value: "4" },
    { label: "Trips", value: "6" },
    { label: "Stamps", value: "6" },
    { label: "Buddies", value: "5" },
  ];
  return (
    <section className={`${WRAP} py-[clamp(48px,6vw,96px)]`}>
      <div className="border-y border-[#d9d9d9] grid md:grid-cols-2">
        <div className="py-6 md:pr-8 flex flex-col justify-between gap-10 md:border-r border-[#d9d9d9]">
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(30px,4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em]" style={{ color: INK }}>
              Collect a stamp
              <br />
              from every trip.
            </h2>
            <p className={`text-[17px] leading-snug ${MUTED} max-w-[400px]`}>
              When a trip ends, its stamp goes into your Passport, with your days away, countries and buddies. Which stamp? You&apos;ll see when you get there.
            </p>
          </div>
          <FadeUp className="flex items-end gap-3">
            <span className="text-[clamp(96px,11vw,160px)] leading-[0.8] font-bold tracking-[-0.06em] tabular-nums" style={{ color: INK }}>
              38
            </span>
            <span className={`${MONO} text-sm ${MUTED} pb-2`}>days away</span>
          </FadeUp>
        </div>

        <div className="py-6 md:pl-8 flex flex-col gap-6">
          <div className="flex justify-between text-[15px]" style={{ color: INK }}>
            <span>Passport · a sample traveller</span>
            <span>2026</span>
          </div>
          {/* The cream passport page: three stamps and a blank for the next trip */}
          <div className="rounded-[20px] bg-[#f6efe2] p-5 sm:p-8 grid grid-cols-2 gap-5 sm:gap-8 place-items-center">
            {PASSPORT_STAMPS.map((st, i) => (
              <FadeUp key={st.file} delay={i * 150} className="w-full max-w-[200px]">
                <Image src={st.file} alt={st.alt} width={400} height={400} sizes="200px" className="w-full h-auto" style={{ transform: `rotate(${st.tilt}deg)` }} />
              </FadeUp>
            ))}
            <div className="w-full max-w-[200px] aspect-square rounded-[24px] border-2 border-dashed border-[#d2c4a8] flex flex-col items-center justify-center gap-2 rotate-3">
              <span className="text-[44px] leading-none font-bold text-[#c2b292]">?</span>
              <span className={`${MONO} text-[10px] text-[#a8977a]`}>Your next trip</span>
            </div>
          </div>
          <dl className="grid grid-cols-4 border-t border-[#d9d9d9] pt-4">
            {stats.map((st) => (
              <div key={st.label} className="flex flex-col gap-1.5">
                <dt className={`${MONO} text-[11px] ${MUTED}`}>{st.label}</dt>
                <dd className="text-[17px] font-semibold tabular-nums" style={{ color: INK }}>
                  {st.value}
                </dd>
              </div>
            ))}
          </dl>
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
      {/* Giant wordmark: needs a large / vector logo to span the full width (only a 306px PNG today) */}
      <div className={`${WRAP} pb-8`}>
        <Image src={logoWhite} alt="Fargo" className="w-[min(100%,460px)] h-auto" sizes="460px" />
      </div>
    </footer>
  );
}
