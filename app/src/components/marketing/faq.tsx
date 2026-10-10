const QUESTIONS = [
  { q: "Is Fargo free?", a: "Yes." },
  { q: "Do I need to download an app?", a: "No. It runs in your browser. Add it to your Home Screen for the full-screen app feel." },
  { q: "Do my travel buddies need to sign up?", a: "No. Add them by name and they're part of the trip straight away. They can join with the invite link any time." },
  { q: "Who can change the plan?", a: "The planner edits the schedule. Buddies suggest ideas and add what they paid." },
  { q: "Which currencies?", a: "Any. Add costs in the local currency; Fargo converts them with the rate you set for the trip." },
  { q: "Who can see the costs we add?", a: "Only people on the trip. Share links show the plan, never the costs." },
];

/** FAQ (BRAND.md wording) — plain <details>, no script needed. */
export function Faq() {
  return (
    <section id="faq" className="py-20 scroll-mt-16">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6 flex flex-col gap-7">
        <h2 className="text-[30px] md:text-[36px] leading-[1.1] font-extrabold tracking-[-0.8px] text-fg">Questions</h2>
        <div className="flex flex-col">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="border-b border-line py-4">
              <summary className="cursor-pointer min-h-7 text-[17px] font-semibold text-fg">{q}</summary>
              <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
