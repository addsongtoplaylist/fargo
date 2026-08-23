import { TripHeader } from "@/components/trip-header";
import { TripTabs } from "@/components/trip-tabs";
import { SwipeTabs } from "@/components/swipe-tabs";
import { TripProvider } from "@/lib/trip-context";
import { getTrip, getMyRole } from "@/lib/actions/trip";
import { notFound } from "next/navigation";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trip, myRole] = await Promise.all([getTrip(id), getMyRole(id)]);

  if (!trip) {
    notFound();
  }

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
