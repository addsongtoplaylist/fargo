"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTrip } from "@/lib/trip-context";

/** Sub-pages: back goes to their section instead of My trips. */
const SUB_TITLES: Record<string, string> = {
  "money/expenses": "Your expenses",
  "money/settle": "Settle up",
};

const TITLES: Record<string, string> = {
  schedule: "Schedule",
  money: "Money",
  prep: "Prep",
  discover: "Discover",
  settings: "Trip settings",
};

/**
 * Trip header for every section except Overview (which has its own cover
 * header with the gear / Leave): round back (→ My trips; on Money's
 * sub-pages → Money), trip name caption, section/sub-page title (DESIGN.md v0.8).
 */
export function TripHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const trip = useTrip();

  const rest = pathname.split(`/trips/${params.id}/`)[1] ?? "overview";
  const section = rest.split("/")[0];
  if (section === "overview") return null;

  const subTitle = SUB_TITLES[rest.split("/").slice(0, 2).join("/")];
  const backHref = subTitle ? `/trips/${params.id}/${section}` : "/trips?noauto=1";

  return (
    <header className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4 pb-3 flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-fg shrink-0 hover:border-fg-faint transition-colors"
        aria-label={subTitle ? `Back to ${TITLES[section]}` : "Back to My trips"}
      >
        <ArrowLeft size={19} strokeWidth={1.9} aria-hidden />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-fg-muted truncate">{trip?.name || "Trip"}</p>
        <h1 className="text-[22px] font-bold text-fg leading-tight tracking-[-0.2px] truncate">{subTitle ?? TITLES[section] ?? "Trip"}</h1>
      </div>
    </header>
  );
}
