import { Suspense } from "react";
import { TripHeader } from "@/components/trip-header";
import { TripTabs } from "@/components/trip-tabs";
import { SwipeTabs } from "@/components/swipe-tabs";
import { TripProvider } from "@/lib/trip-context";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/skeleton";

/**
 * Skeleton shell rendered instantly while trip data loads.
 * Matches the real layout's header + tab structure so there's
 * no layout shift when the data resolves.
 */
function TripLayoutSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header skeleton — matches TripHeader's two-line layout */}
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex items-center h-12 gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      </header>

      {/* Tab bar skeleton — matches TripTabs */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex gap-1 py-2.5">
          {["Overview", "Schedule", "Money", "Prep", "People"].map((label) => (
            <Skeleton key={label} className="h-4 w-16 shrink-0" />
          ))}
        </div>
      </nav>

      {/* Content area skeleton */}
      <div className="flex-1">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 py-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Async component that fetches trip data and renders the real layout.
 * Wrapped in Suspense so the skeleton streams to the browser immediately.
 */
async function TripLayoutInner({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const [trip, account] = await Promise.all([
    getTrip(id),
    getOrCreateAccount(),
  ]);

  if (!trip) {
    notFound();
  }

  // Derive role from travellers array — no extra query needed
  const myRole = trip.travellers?.find(
    (t: { account_id: string; role: string }) => t.account_id === account?.id
  )?.role;

  return (
    <TripProvider trip={{ ...trip, myRole: myRole ?? undefined }}>
      <div className="flex flex-col min-h-full">
        <TripHeader />
        <TripTabs />
        <SwipeTabs>
          <div className="flex-1">{children}</div>
        </SwipeTabs>
      </div>
    </TripProvider>
  );
}

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<TripLayoutSkeleton />}>
      <TripLayoutInner id={id}>{children}</TripLayoutInner>
    </Suspense>
  );
}
