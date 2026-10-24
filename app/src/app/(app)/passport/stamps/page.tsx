import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Column } from "@/components/column";
import { PassportBook } from "@/components/passport-book";
import { getPassport } from "@/lib/actions/passport";

/**
 * Passport → See all: every stamp — to collect, in progress, collected (×2 for repeats), upcoming
 * (v0.5.6, v0.5.17) — inside a passport book since v0.7.3 (cover → ID page → stamp pages).
 */
export default async function AllStampsPage() {
  const passport = await getPassport();

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
        <h1 className="text-xl font-bold text-fg">My passport</h1>
      </div>

      <div className="mt-8">
        {passport ? (
          <PassportBook stats={passport.stats} />
        ) : (
          <p className="text-sm text-fg-muted text-center mt-10">Sign in to see your passport.</p>
        )}
      </div>
    </Column>
  );
}
