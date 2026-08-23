import { TripHeader } from "@/components/trip-header";
import { TripTabs } from "@/components/trip-tabs";
import { SwipeTabs } from "@/components/swipe-tabs";
import { TripProvider } from "@/lib/trip-context";
import { getTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { notFound } from "next/navigation";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
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
        <TripTabs />
        <SwipeTabs>
          <div className="flex-1">{children}</div>
        </SwipeTabs>
      </div>
    </TripProvider>
  );
}
