import { Plus, Search } from "lucide-react";

/** "Add an activity in 3 steps" — each step shows a small piece of the real Add activity flow. */
export function AddActivitySteps() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-[32px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.8px] md:tracking-[-1.2px] text-fg">Add an activity in 3 steps</h2>
          <p className="text-[17px] text-fg-muted">Building a day takes seconds.</p>
        </div>
        <ol className="w-full grid grid-cols-1 md:grid-cols-3 gap-7">
          <Step n={1} title="Pick the day, tap +" body="Open any day of your trip and tap the + button.">
            <div className="relative">
              <div className="flex gap-1.5">
                {["Fri 14", "Sat 15", "Sun 16"].map((d, i) => (
                  <span key={d} className={`flex-1 text-center rounded-lg py-1.5 text-[11px] ${i === 1 ? "bg-brand text-white font-semibold" : "bg-page"}`}>{d}</span>
                ))}
              </div>
              <div className="mt-2.5 h-2.5 w-4/5 rounded-full bg-skeleton" />
              <div className="mt-2 h-2.5 w-3/5 rounded-full bg-skeleton" />
              <span className="absolute -right-2.5 -bottom-3.5 w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center shadow-[0_8px_18px_rgba(0,113,188,0.35)]">
                <Plus size={22} aria-hidden />
              </span>
            </div>
          </Step>
          <Step n={2} title="Say what and where" body="Type the plan and search the place. Fargo finds it for you.">
            <div className="flex flex-col gap-2">
              <span className="text-[15px] font-bold text-fg">Cloud Forest<span className="ml-0.5 inline-block w-0.5 h-4 align-[-3px] bg-brand" /></span>
              <span className="flex items-center gap-1.5 rounded-[10px] border border-line px-2.5 py-1.5 text-xs text-fg">
                <Search size={13} className="text-fg-muted" aria-hidden />
                Gardens by the Bay
              </span>
              <span className="pl-1 text-[11px] text-fg-muted">18 Marina Gardens Dr, Singapore</span>
            </div>
          </Step>
          <Step n={3} title="Pick a time, save" body="Add a time or leave it open. It lands on the day and on the map.">
            <div className="flex flex-col gap-2">
              <span className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">Time</span>
                <span className="rounded-lg border border-line px-2.5 py-1 font-semibold text-fg">09 : 30</span>
              </span>
              <span className="flex items-center gap-2 rounded-[10px] bg-brand-soft px-2.5 py-2 text-xs text-fg">
                <b>09:30</b> Cloud Forest <span className="ml-auto font-bold text-money-ok">Added ✓</span>
              </span>
            </div>
          </Step>
        </ol>
      </div>
    </section>
  );
}

function Step({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-3.5">
      <div className="min-h-[170px] rounded-[20px] bg-surface px-6 pt-7 pb-8 flex items-center">
        <div className="w-full rounded-[14px] bg-surface border border-line px-3.5 py-3">{children}</div>
      </div>
      <b className="text-lg text-fg">
        {n}. {title}
      </b>
      <span className="text-[15px] leading-relaxed text-fg-muted">{body}</span>
    </li>
  );
}
