"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { PhoneFrame, PhotoFrame } from "./frames";

const FEATURES = [
  {
    title: "Planner",
    photoSrc: "/marketing/photo-planner.webp" as string | undefined,
    tint: "bg-brand-soft",
    body: "A day-by-day itinerary built around what you want to do, not a tour package. During the trip it opens on today.",
    screen: "Fargo schedule with places and times",
    src: "/marketing/screen-schedule.webp",
    photo: "Gardens by the Bay, Singapore",
  },
  {
    title: "Travel buddies",
    photoSrc: "/marketing/photo-buddies.webp" as string | undefined,
    tint: "bg-[#f6eedc]",
    body: "Invite your friends with one link. They suggest ideas, you decide what makes the schedule.",
    screen: "Fargo Prep with a packing list and ideas",
    src: "/marketing/screen-prep.webp",
    photo: "Friends having fun together outdoors",
  },
  {
    title: "Shared costs",
    photoSrc: "/marketing/photo-costs.webp" as string | undefined,
    tint: "bg-money-ok-soft",
    body: "Everyone adds what they paid along the way. Fargo keeps it fair, with no awkward chat at the end.",
    screen: "Fargo Money with the group split",
    src: "/marketing/screen-money.webp",
    photo: "Friends sharing dishes around a dinner table",
  },
  {
    title: "Passport",
    photoSrc: "/marketing/photo-passport.webp" as string | undefined,
    tint: "bg-cat-stay-soft",
    body: "Every trip earns a stamp. See your countries, trips and travel buddies add up, then share a trip card.",
    screen: "Fargo Passport with stamps and travel stats",
    src: "/marketing/screen-passport.webp",
    photo: "A camera, sunglasses and a bag packed for a trip",
  },
];

/** "Your trip, your way." — Klarna-style switcher on desktop, an open list on phones. */
export function FeatureSwitcher() {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];

  return (
    <section id="features" className="py-24 scroll-mt-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-3.5">
          <Image src="/mascot.png" alt="" width={64} height={64} className="rounded-2xl shadow-[0_10px_24px_rgba(0,113,188,0.20)]" />
          <h2 className="text-[32px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.8px] md:tracking-[-1.2px] text-fg">Your trip, your way.</h2>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-fg-muted">
            The plan, the places and the people in one trip. Here&apos;s what&apos;s inside.
          </p>
        </div>

        {/* Desktop: picture on one side, features on the other */}
        <div className="hidden md:grid grid-cols-2 gap-14 items-center">
          <PhotoFrame label={f.photo} src={f.photoSrc} plain className={`rounded-[28px] pt-14 pb-10 px-6 flex justify-center ${f.tint}`}>
            <PhoneFrame label={f.screen} src={f.src} />
          </PhotoFrame>
          <div className="flex flex-col gap-5">
            {FEATURES.map((item, i) => {
              const on = i === active;
              return (
                <div key={item.title} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={on}
                    className={`text-left text-[36px] font-extrabold tracking-[-0.8px] leading-tight transition-colors ${on ? "text-fg" : "text-[#b4bbc7] hover:text-fg-muted"}`}
                  >
                    {item.title}
                  </button>
                  {on && (
                    <>
                      <p className="max-w-[440px] text-base leading-relaxed text-fg-muted">{item.body}</p>
                      <Link href="/sign-in" className={`${buttonClasses("primary", "md")} self-start mt-1.5`}>
                        Try it out
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phones: every feature open */}
        <div className="md:hidden flex flex-col gap-3">
          {FEATURES.map((item) => (
            <div key={item.title} className="rounded-[20px] bg-surface overflow-hidden flex flex-col gap-1.5 pb-5">
              <PhotoFrame label={item.photo} src={item.photoSrc} plain className={`h-[150px] mb-2.5 ${item.tint}`} />
              <b className="px-5 text-[22px] tracking-[-0.4px] text-fg">{item.title}</b>
              <p className="px-5 text-[15px] leading-relaxed text-fg-muted">{item.body}</p>
              <Link href="/sign-in" className={`${buttonClasses("primary", "md")} self-start mx-5 mt-1.5`}>
                Try it out
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

