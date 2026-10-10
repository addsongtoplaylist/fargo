import { CalendarDays, Clock, Home, Plane, Receipt, ArrowLeftRight, UserPlus, Utensils, type LucideIcon } from "lucide-react";
import { IllustrationFrame } from "./frames";

type Item = { icon: LucideIcon; title: string; body: string; tint: string; ink: string };
type Stage = { when: string; title: string; icon: LucideIcon; illustration: string; illustrationSrc: string; items: Item[] };

const STAGES: Stage[] = [
  {
    when: "Before the trip",
    title: "Plan it together",
    icon: CalendarDays,
    illustration: "A desk with a calendar, suitcases, a laptop, a compass and a map pin",
    illustrationSrc: "/marketing/illus-before.webp",
    items: [
      { icon: CalendarDays, title: "Plan the days", body: "Places and times, day by day.", tint: "bg-brand-soft", ink: "text-brand" },
      { icon: UserPlus, title: "Share with buddies", body: "One invite link; friends suggest ideas.", tint: "bg-[#f6eedc]", ink: "text-[#7a5a12]" },
    ],
  },
  {
    when: "During the trip",
    title: "Enjoy every day",
    icon: Plane,
    illustration: "An open guidebook, a map with a pin, a backpack and a clock showing 14:30",
    illustrationSrc: "/marketing/illus-during.webp",
    items: [
      { icon: Clock, title: "Follow today's schedule", body: "Opens on today: now and next.", tint: "bg-brand-soft", ink: "text-brand" },
      { icon: Utensils, title: "Discover where to eat", body: "Good food near your stay.", tint: "bg-cat-food-soft", ink: "text-cat-food" },
    ],
  },
  {
    when: "After the trip",
    title: "Square it up",
    icon: Home,
    illustration: "A calculator, a suitcase and a piggy bank",
    illustrationSrc: "/marketing/illus-after.webp",
    items: [
      { icon: Receipt, title: "Log the expenses", body: "Everyone adds what they paid.", tint: "bg-money-ok-soft", ink: "text-money-ok" },
      { icon: ArrowLeftRight, title: "Settle up", body: "See who pays who back.", tint: "bg-money-ok-soft", ink: "text-money-ok" },
    ],
  },
];

/** "One trip, start to finish." — progress timeline: horizontal on desktop, vertical on phones. */
export function JourneyTimeline() {
  return (
    <section id="journey" className="bg-surface py-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col gap-14">
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-[32px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.8px] md:tracking-[-1.2px] text-fg">One trip, start to finish.</h2>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-fg-muted">Fargo is with you from the first idea to the last settle-up.</p>
        </div>

        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 pl-16 md:pl-0">
          {/* Track: vertical on phones, horizontal on desktop. Three equal stages, all filled (no fake "progress"). */}
          <li aria-hidden className="absolute rounded-full bg-brand left-[23px] top-6 bottom-6 w-1 md:left-[16.66%] md:right-[16.66%] md:bottom-auto md:top-[23px] md:w-auto md:h-1" />
          {STAGES.map((s) => (
            <li key={s.when} className="relative flex flex-col md:items-center gap-5">
              <span
                className="absolute -left-16 top-0 md:static w-[50px] h-[50px] rounded-full border-[3px] border-brand bg-brand text-white flex items-center justify-center z-[1]"
              >
                <s.icon size={20} aria-hidden />
              </span>
              <div className="self-stretch rounded-[20px] bg-page p-5 flex flex-col gap-1.5">
                <div className="mb-2.5">
                  <IllustrationFrame label={s.illustration} src={s.illustrationSrc} />
                </div>
                <span className="text-[13px] font-semibold uppercase tracking-wide text-brand">{s.when}</span>
                <b className="text-[22px] tracking-[-0.4px] text-fg">{s.title}</b>
                <ul className="mt-1.5 flex flex-col gap-3.5">
                  {s.items.map((it) => (
                    <li key={it.title} className="flex gap-3 items-start">
                      <span className={`w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 ${it.tint} ${it.ink}`}>
                        <it.icon size={18} aria-hidden />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <b className="text-base text-fg">{it.title}</b>
                        <span className="text-sm leading-normal text-fg-muted">{it.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
