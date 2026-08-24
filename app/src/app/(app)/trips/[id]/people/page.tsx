import { Column } from "@/components/column";
import { getTrip, getMyRole } from "@/lib/actions/trip";
import { PeopleList } from "@/components/people/people-list";
import { notFound } from "next/navigation";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trip, myRole] = await Promise.all([getTrip(id), getMyRole(id)]);

  if (!trip) notFound();

  return (
    <Column className="py-4">
      <PeopleList
        tripId={trip.id}
        travellers={trip.travellers ?? []}
        plannerId={trip.planner_id}
        isPlanner={myRole === "planner"}
      />
    </Column>
  );
}
