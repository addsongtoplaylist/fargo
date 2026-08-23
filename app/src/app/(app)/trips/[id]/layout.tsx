import { TripHeader } from "@/components/trip-header";
import { TripTabs } from "@/components/trip-tabs";
import { TripProvider } from "@/lib/trip-context";
import { getTrip } from "@/lib/actions/trip";
import { notFound } from "next/navigation";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  return (
    <TripProvider trip={trip}>
      <div className="flex flex-col min-h-full">
        <TripHeader />
        <TripTabs />
        <div className="flex-1">{children}</div>
      </div>
    </TripProvider>
  );
}
