import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Column } from "@/components/column";
import { PassportStamp, PASSPORT_PAGE } from "@/components/passport-stamp";
import { getPassport } from "@/lib/actions/passport";

/** Passport → See all: every stamp, newest first (v0.5.6). */
export default async function AllStampsPage() {
  const passport = await getPassport();
  const stamps = passport?.stats.stamps ?? [];

  return (
    <Column className="pt-4 pb-8">
      <div className="flex items-center gap-3">
        <Link
          href="/passport"
          aria-label="Back to Passport"
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-fg shrink-0"
        >
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="text-xl font-bold text-fg">
          Stamps <span className="font-normal text-fg-muted">· {stamps.length}</span>
        </h1>
      </div>

      <section className={`${PASSPORT_PAGE} p-3.5 mt-6`}>
        <div className="grid grid-cols-[repeat(3,76px)] justify-center gap-x-4 gap-y-3 py-2">
          {stamps.map((stamp) => (
            <PassportStamp key={stamp.tripId} stamp={stamp} />
          ))}
        </div>
      </section>
    </Column>
  );
}
