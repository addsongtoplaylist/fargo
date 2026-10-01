import { Suspense } from "react";
import { TripHeader } from "@/components/trip-header";
import { TripBar } from "@/components/trip-bar";
import { SwipeTabs } from "@/components/swipe-tabs";
import { TripProvider } from "@/lib/trip-context";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { notFound } from "next/navigation";
import { Bone } from "@/components/ui/bone";

/**
 * Skeleton shell rendered instantly while trip data loads.
 * Matches the real layout's header + tab structure so there's
 * no layout shift when the data resolves.
 */
function TripLayoutSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header skeleton — matches TripHeader: round back + caption + title */}
      <div className="mx-auto w-full max-w-[var(--max-width-column)] px-4 pt-4 pb-3 flex items-center gap-3">
        <Bone className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-3 w-24" />
          <Bone className="h-5 w-32" />
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="flex-1">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 py-4 space-y-3">
          <Bone className="h-10 w-full rounded-lg" />
          <Bone className="h-24 w-full rounded-lg" />
          <Bone className="h-24 w-full rounded-lg" />
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
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
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
        <SwipeTabs>
          <div className="flex-1">{children}</div>
        </SwipeTabs>
        <TripBar />
      </div>
    </TripProvider>
  );
}

export default function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TripLayoutSkeleton />}>
      <TripLayoutInner params={params}>{children}</TripLayoutInner>
    </Suspense>
  );
}
