import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import Image from "next/image";

/** Hero (TravelPerk style): headline, one button, phone with floating app details. */
export function Hero() {
  return (
    <section className="bg-[#edf3f9] pt-16 overflow-hidden">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col items-center text-center gap-7">
        <h1 className="text-[44px] md:text-[72px] leading-[1.02] font-extrabold tracking-[-1.4px] md:tracking-[-2.4px] text-fg">
          Every trip
          <br />
          starts here.
        </h1>
        <Link href="/sign-in" className={`${buttonClasses("primary", "lg")} h-14 px-8 text-[17px]`}>
          Start planning, it&apos;s free
        </Link>
      </div>

      <div className="relative mx-auto mt-10 max-w-[820px] h-[500px] flex justify-center">
        <div className="relative z-[1] w-full max-w-[520px] h-[500px] overflow-hidden rounded-t-[32px]">
          <Image
            src="/marketing/hero-hand.webp"
            alt="A hand holding a phone showing Fargo's schedule for a day in Singapore"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover object-top"
            priority
          />
        </div>

        <FloatCard className="left-0 top-10" label="Planner">
          <span className="flex items-center gap-2">
            <span className="rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">NOW</span>
            <b>09:30 Gardens by the Bay</b>
          </span>
        </FloatCard>
        <FloatCard className="left-10 top-[200px]" row>
          <span className="w-9 h-9 rounded-full bg-[#f6eedc] text-[#7a5a12] text-sm font-bold flex items-center justify-center shrink-0">M</span>
          <span className="flex flex-col text-left">
            <b>Mei</b>
            <span className="text-xs text-fg-muted">suggested Night Safari</span>
          </span>
        </FloatCard>
        <FloatCard className="right-0 top-5 min-w-[220px] hidden md:flex" label="Your passport">
          <span className="grid grid-cols-3 gap-2 mt-1">
            <Stat value="7" label="countries" />
            <Stat value="12" label="trips" divider />
            <Stat value="9" label="buddies" divider />
          </span>
        </FloatCard>
        <FloatCard className="right-8 top-[190px] hidden md:flex" label="Shared costs">
          <span className="flex items-center gap-2">
            <b>Costs shared</b>
            <span className="rounded-full bg-money-ok-soft px-2 py-0.5 text-xs font-bold text-money-ok">All square ✓</span>
          </span>
        </FloatCard>
      </div>
    </section>
  );
}

function FloatCard({ label, className, row = false, children }: { label?: string; className: string; row?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute z-[2] flex ${row ? "flex-row items-center gap-2.5" : "flex-col gap-1"} rounded-2xl border border-line bg-surface px-3.5 py-3 text-[13px] text-left shadow-[0_12px_28px_rgba(23,32,51,0.10)] ${className}`}
    >
      {label && <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{label}</span>}
      {children}
    </div>
  );
}

function Stat({ value, label, divider = false }: { value: string; label: string; divider?: boolean }) {
  return (
    <span className={`flex flex-col ${divider ? "border-l border-line pl-2" : ""}`}>
      <b className="text-xl">{value}</b>
      <span className="text-[11px] text-fg-muted">{label}</span>
    </span>
  );
}
